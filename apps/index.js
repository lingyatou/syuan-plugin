import { UpdateMemeRepos } from './ssh.js'
import { welcome } from './other.js'
import { OpenCommand } from './gs.js'
import { Update } from './update.js'
import { keyword } from './keyword.js'
import { Good } from './good.js'
import { Undercover } from './underCover.js'
import { newcomer } from './newcomer.js'
import { run } from './run.js'
import { poke_to_2YM } from './poke.js'


import { test } from './test.js'
import { botHelp } from './botHelp.js'
import { gpt } from './huilv.js'
import { aliyun } from './aliyun.js'


export const ssh = UpdateMemeRepos
export const Welcome = welcome
export const grasscutter = OpenCommand
export const updateplugin = Update
export const Keyword = keyword
export const good = Good
export const underCover = Undercover
export const Newcomer = newcomer
export const Run = run
export const Poke_to_2YM = poke_to_2YM
export const BotHelp = botHelp
export const GP = gpt

export const Test = test
export const Aliyun = aliyun



export default [UpdateMemeRepos, Welcome, grasscutter, updateplugin, Keyword, good, underCover, Newcomer, Run, Test, BotHelp, Poke_to_2YM, GP, Aliyun]