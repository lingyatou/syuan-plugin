import { UpdateMemeRepos } from './ssh.js'
import { welcome } from './other.js'
import { OpenCommand } from './gs.js'
import { Update } from './update.js'
import { keyword } from './keyword.js'
import { Good } from './good.js'
import { Undercover } from './underCover.js'
import { newcomer } from './newcomer.js'
import { run } from './run.js'

import { test } from './test.js'

export const ssh = UpdateMemeRepos
export const Welcome = welcome
export const grasscutter = OpenCommand
export const updateplugin = Update
export const Keyword = keyword
export const good = Good
export const underCover = Undercover
export const Newcomer = newcomer
export const Run = run

// export const Test = test


export default [UpdateMemeRepos, Welcome, grasscutter, updateplugin, Keyword, good, underCover, Newcomer, Run]