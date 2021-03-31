import request from "@/lib/instance/request";

export async function getSystemInfoAPI(baseURL: string) {
  return request({
    baseURL: baseURL,
    method: "get",
    url: "/api/public/system"
  })
}