'use strict';

const fs = require('fs');
const path = require('path');
const { parseTasks } = require('./writing-feedback');

const TASKS_FILE = path.resolve(__dirname, '..', 'data', 'writing-tasks.json');

/** Đọc và kiểm tra data/writing-tasks.json (chỉ dùng trên Node). */
function loadTasks(file = TASKS_FILE) {
    return parseTasks(JSON.parse(fs.readFileSync(file, 'utf8')));
}

module.exports = { loadTasks, TASKS_FILE };
