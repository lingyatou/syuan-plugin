import { UpdateMemeRepos } from './ssh.js'
import { WwCheck } from './welcome.js'
import { OpenCommand } from './gs.js'
import { Update } from './update.js'

export const ssh = UpdateMemeRepos
export const welcome = WwCheck
export const grasscutter = OpenCommand
export const updateplugin = Update

export default [UpdateMemeRepos, WwCheck, grasscutter, updateplugin]