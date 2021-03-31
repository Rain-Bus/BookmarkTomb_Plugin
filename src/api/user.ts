import request from "@/lib/instance/request";

export async function getCodeImgAPI() {
  return request({
    url: "/api/code/img",
    method: "get",
  });
}

export async function loginAPI(data: Object) {
  return request({
    url: "/api/user/login",
    method: "post",
    data
  })
}

export async function getUserInfoAPI() {
  return request({
    url: "/api/user",
    method: "get",
  })
}

export async function getAvatarAPI() {
  return request({
    url: "/api/user/avatar",
    method: "get"
  })
}

export async function logoutAPI() {
  return request({
    url: "/api/user/logout"
  })
}