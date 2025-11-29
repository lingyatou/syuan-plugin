import OpenAI from "openai";
import * as lancedb from "@lancedb/lancedb";
import { paths, cfgdata } from "./index.js";
import fs from "fs";
import path from "path";


// 加载配置数据
const cfgData = cfgdata.loadCfg()

const DB_DIR = path.join(paths.rootDataPath, "lancedb");

if (cfgData.Embedding.apiKey === "" || cfgData.Embedding.apiKey === undefined) {
    logger.warn("未配置OpenAI API Key，向量数据库功能不可用");
}
if (cfgData.Embedding.baseURL === "" || cfgData.Embedding.baseURL === undefined) {
    logger.warn("未配置OpenAI API Base URL，向量数据库功能不可用");
}

const client = new OpenAI({
    apiKey: cfgData.Embedding.apiKey,
    baseURL: cfgData.Embedding.baseURL,
    timeout: 60000
});

//处理数据


// 文本向量化函数
async function embedText(text) {
    try {
        const res = await client.embeddings.create({
            model: cfgData.Embedding.model || "text-embedding-3-small",
            input: text,
        });

        if (!res?.data?.[0]?.embedding) throw new Error("向量化模型返回数据不符合预期");

        const embedding = res.data[0].embedding;

        return embedding instanceof Float32Array ? embedding : new Float32Array(embedding);
    } catch (err) {
        logger.error("[Syuan-Plugin]生成向量出错:", err);
        return new Float32Array(1536).fill(0);
    }
}



/**
 * 分表加载数据到向量数据库
 * @param {*} e 传入的事件对象
 */
export async function loadData(e) {
    try {

        let allChunks = [];
        // 遍历md目录下的所有md文件
        const fileCategories = path.join(paths.pluginDataPath,  "md");
        const mdFiles = fs.readdirSync(fileCategories)
            .filter(f => f.endsWith(".md"))
            .map(f => path.join(fileCategories, f));

        //载入数据
        for (const filePath of mdFiles) {
            let chunks = await processMarkdown(filePath);

            allChunks.push(...chunks);
        }
        await loadCategoryData('exercise', allChunks);
        logger.info("[Syuan-Plugin]所有数据已写入向量数据库");
        e.reply("[Syuan-Plugin]所有数据已写入向量数据库");
    } catch (error) {
        logger.error("[Syuan-Plugin]数据写入过程中出错:", error);
        e.reply(`[Syuan-Plugin]数据写入过程中出错`);
    }
}


// 为chunk生成向量并写入数据库
async function loadCategoryData(category, chunks) {
    const tableName = `${category}`;
    const rows = [];
    let num = 0;
    const sum = chunks.length;

    for (const chunk of chunks) {
        const safeText = chunk.text;
        if (!safeText) {
            continue;
        }

        // 调用 embedding API
        const float32Vector = await embedText(safeText);

        logger.info('[Syuan-Plugin] vector type:', float32Vector.constructor.name);
        logger.info('[Syuan-Plugin] vector length:', float32Vector.length);
        logger.info(`[Syuan-Plugin] 生成 ${category} 向量 ${++num}/${sum}`);

        // 用 processMarkdown 生成的 id
        const id = chunk.id;

        rows.push({
            id,
            vector: Array.from(float32Vector),
            metadata: safeText
        });
    }

    try {
        const db = await lancedb.connect(DB_DIR);
        const tableNames = await db.tableNames();

        // 如果表已存在，先删除
        if (tableNames.includes(tableName)) {
            logger.info(`[Syuan-Plugin] 删除已存在的表: ${tableName}`);
            await db.dropTable(tableName);
        }

        // 创建新表
        logger.info(`[Syuan-Plugin] 创建新表: ${tableName}`);
        await db.createTable(tableName, rows, {
            vectorColumn: "vector",
            vectorIndex: { type: "IVFFlat", metric: "cosine" }
        });

        logger.info(`[Syuan-Plugin] 表 ${tableName} 创建完成，共写入 ${rows.length} 条记录`);
    } catch (error) {
        logger.error(`[Syuan-Plugin] 写入 ${category} 数据出错:`, error);
        throw error;
    }
}






export async function searchWiki(query, topK = 3) {
    const queryVector = Array.from(await embedText(query));
    const db = await lancedb.connect(DB_DIR);

    // 动态获取所有表名
    const tableNames = await db.tableNames();

    const resultsArr = await Promise.all(tableNames.map(async tableName => {
        try {
            const table = await db.openTable(tableName);
            const searchRes = await table.search(queryVector).limit(topK);
            const results = await searchRes.toArray();

            return results.map(x => ({
                score: x._distance,
                metadata: x.metadata,
                table: tableName
            }));
        } catch (err) {
            logger.warn(`[searchWiki] 搜索表 ${tableName} 出错:`, err);
            return [];
        }
    }));

    const flatResults = resultsArr.flat();
    return flatResults.sort((a, b) => a.score - b.score).slice(0, topK).map(x => x.metadata).join("\n");
}






//======================================================================================
// 以下是按照Markdown标题分割chunk的代码
//======================================================================================



async function processMarkdown(filePath) {
    const mdContent = fs.readFileSync(filePath, "utf-8");
    const sections = splitMarkdownByHeading(mdContent);

    const rows = [];
    let idx = 0;

    for (const sec of sections) {
        const parts = splitText(sec.text, 500);

        for (let i = 0; i < parts.length; i++) {
            const id = `${sec.h1 || "root"}-${sec.h2 || "none"}-${sec.h3 || "none"}-${i + 1}`;
            rows.push({
                id,
                text: parts[i],
                metadata: {
                    h1: sec.h1,
                    h2: sec.h2,
                    h3: sec.h3
                }
            });
            idx++;
        }
    }
    return rows;
}


// 按标题拆分 Markdown
function splitMarkdownByHeading(mdContent) {
    const lines = mdContent.split("\n");
    const chunks = [];

    let h1 = "", h2 = "", h3 = "";
    let buffer = [];

    const pushChunk = () => {
        if (buffer.length > 0) {
            chunks.push({
                h1, h2, h3,
                text: buffer.join("\n").trim()
            });
            buffer = [];
        }
    };

    for (const line of lines) {
        if (line.startsWith("# ")) {
            pushChunk();
            h1 = line.replace(/^# /, "").trim();
            h2 = "";
            h3 = "";
        } else if (line.startsWith("## ")) {
            pushChunk();
            h2 = line.replace(/^## /, "").trim();
            h3 = "";
        } else if (line.startsWith("### ")) {
            pushChunk();
            h3 = line.replace(/^### /, "").trim();
        } else {
            buffer.push(line);
        }
    }
    pushChunk();

    return chunks.filter(c => c.text.length > 0);
}

// 二次切分（防止内容过长）
function splitText(text, maxLen = 500) {
    if (!text || text.trim().length === 0) return [];
    const chunks = [];
    let buffer = "";

    const sentences = text.split(/(?<=[。！？；.!?;])/);

    for (const sentence of sentences) {
        if ((buffer + sentence).length > maxLen) {
            if (buffer.trim().length > 0) {
                chunks.push(buffer.trim());
            }
            buffer = sentence;
        } else {
            buffer += sentence;
        }
    }
    if (buffer.trim().length > 0) chunks.push(buffer.trim());

    return chunks;
}



//======================================================================================