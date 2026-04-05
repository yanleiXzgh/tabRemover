/**
 * 重构后的content-script.js - 使用面向对象架构
 */

// 导入MessageHandler类
import { MessageHandler } from '../src/classes/MessageHandler.js';

// 初始化MessageHandler
const messageHandler = new MessageHandler();

// 启动消息监听器
messageHandler.init();