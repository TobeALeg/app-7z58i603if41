# 智能体比赛报名网站需求文档

## 1. 网站概述

### 1.1 网站名称
智能体比赛报名平台

### 1.2 网站描述
专为智能体比赛打造的在线报名网站，集成学校统一身份认证OAuth 2.0 SSO，为参赛者提供便捷的报名服务，展示比赛信息，收集参赛资料。

## 2. 功能需求

### 2.1 核心功能
- 统一身份认证SSO：接入学校OAuth 2.0认证系统，用户通过学校账号一键登录
- 在线报名系统：收集参赛者基本信息和作品信息
- 比赛信息展示：展示比赛规则、时间安排、参赛要求
- 报名状态查询：查看报名进度和审核状态
- 作品提交：支持参赛作品上传
- 比赛通知：重要时间节点的通知提醒

### 2.2 页面结构
- 首页：比赛介绍、报名入口、重要时间
- 报名页面：报名表单填写
- 作品提交页面：作品上传和信息完善
- 我的报名：查看报名状态和个人信息
- 比赛规则：详细的比赛要求和评分标准

## 3. 技术要求

### 3.1 认证系统

#### 3.1.1 CAS认证对接指南
**支持版本：** 1.5.0+

**对接准备：**
- 提供应用域名、回调地址，完成应用注册后，将client_id、client_secret给到应用对接方
- clientId: CijBwB5EwTTXouO7
- clientSecret: O8dOsXE7p7yMbh18KEP2Z6

**认证流程：**

##### 3.1.2 获取授权码（Authorization Code）
**步骤1：跳转到授权页面**
用户访问第三方应用，若未登录时，第三方应用需要将用户浏览器重定向到认证服务的OAuth2授权页面/cas/oauth2.0/authorize，同时可带上以下参数：

- `response_type`: 固定值 code
- `client_id`: 应用注册时生成的唯一标识
- `redirect_uri`: 第三方应用的回调地址（须和应用注册时的回调地址保持匹配）
- `state`: 第三方应用生成的随机字符串，返回时会原样返回，用于防止CSRF攻击

**请求示例：**
GET /cas/oauth2.0/authorize?response_type=code&client_id=CijBwB5EwTTXouO7&redirect_uri=https://example.com/oauth2/authcode&state=YOUR_RANDOM_STATE HTTP/1.1
Host: cas.example.com

**步骤2：用户登录**
用户在登录页面输入自己的用户名、密码进行登录，OAuth Server（CAS认证）对用户进行认证，并由用户进行确认授权。

**步骤3：响应处理**
- **认证成功：** OAuth Server（CAS认证）会将授权码（authorization code）通过redirect_uri，以code参数名传递给第三方应用
- **认证失败：** 重新回到登录页面并显示错误信息

**成功响应示例：**
HTTP/1.1 302 Found
Location: https://example.com/oauth2/authcode?code=OC-2-lO-RjC5flQ3fqsw2LV0bAYEvy6rVfyXV&state=YOUR_RANDOM_STATE

##### 3.1.3 使用授权码换取 Access Token
**步骤1：获取授权码**
第三方应用从浏览器请求中获取code参数值，并校验state的一致性

**步骤2：换取 Access Token**
第三方应用请求/oauth2.0/accessToken，以换取Access Token，并获取JSON格式的响应结果

**请求参数：**
- `grant_type`: 固定值 authorization_code
- `client_id`: 应用注册时生成的唯一标识
- `client_secret`: 应用注册时生成的密钥\n- `redirect_uri`: 与认证登录时的redirect_uri保持一致
- `code`: 认证登录返回的授权码（Authorization Code）

**请求示例：**
GET /cas/oauth2.0/accessToken?grant_type=authorization_code&client_id=CijBwB5EwTTXouO7&client_secret=O8dOsXE7p7yMbh18KEP2Z6&redirect_uri=https://example.com/oauth2/authcode&code=OC-2-lO-RjC5flQ3fqsw2LV0bAYEvy6rVfyXV HTTP/1.1
Host: cas.example.com

**响应成功：**
HTTP/2 200
content-type: application/json;charset=UTF-8

{"access_token":"AT-1-4OAC0xUWy-QX0zfMr2ERQHUCxbTRSJZ-