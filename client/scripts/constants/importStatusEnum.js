// 资料导入的前端状态，反映导入过程在前端页面的处理过程，与后端状态并不一一对应
export const STATUS_INITIALIZED = 'initialized';  // 状态初始化，显示资料导入列表
export const STATUS_PROCESSING = 'processing';    // 资料导入处理中，显示导入进度
export const STATUS_PENDING = 'pending';
export const STATUS_FAILURE = 'failure';          // 资料导入失败
export const STATUS_SUCCESS = 'success';          // 资料导入成功
