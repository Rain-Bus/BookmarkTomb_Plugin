export interface ImgVerifyCode {
  codeUid: string,
  codeImg: string
}

export class UserInfo {
  isAdmin: boolean
  isEnabled: boolean
  email: string
  id: number
  username: string
  nickname?: string
}