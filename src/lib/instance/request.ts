import axios, {AxiosError} from "axios";
import Config from "@/model/constant/settings";
import {ErrorMessage} from "@/model/request/error";

const service = axios.create({
  timeout: Config.timeout,
  baseURL: Config.baseURL
});

service.interceptors.request.use(config => {
  config.headers["rememberMe"] = true;
  config.headers["Authorization"] = localStorage.getItem(Config.tokenName)
  return config;
});

service.interceptors.response.use(response => {
  return response
}, async (error: AxiosError) => {
  return Promise.reject(<ErrorMessage>error.response.data)
})

export default service;