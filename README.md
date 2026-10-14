# English A1–A2 Practice – Ngân hàng câu hỏi

Ứng dụng web tĩnh để luyện tập và thi thử tiếng Anh trình độ A1–A2, kèm ngân hàng **1.000 câu hỏi** lưu ở dạng JSON.

> **Lưu ý về ENT104:** toàn bộ câu hỏi là nội dung tiếng Anh tổng quát A1–A2 (`source: "general_a1_a2"`, `unit: null`).
> Nội dung **chưa được đối chiếu** với đề cương chính thức của học phần ENT104 – Trường Đại học FPT. Không có câu nào được gán unit, bài học, giáo trình hay tỷ trọng đề thi.

## Chạy ứng dụng

Cách 1 – qua web server (khuyến nghị, cần Node.js ≥ 16, không cần cài thêm gói):

```bash
npm start            # hoặc: node scripts/serve.js
# mở http://localhost:8080
```

Cách 2 – mở trực tiếp `index.html` bằng trình duyệt (file://). Khi đó trình duyệt không cho đọc file JSON nên ứng dụng tự chuyển sang dùng `data/question-bank.bundle.js`.

Ứng dụng dùng Tailwind CSS, Font Awesome và font Inter qua CDN nên cần kết nối Internet để hiển thị đúng giao diện.

## Tính năng

- **Practice Mode:** chọn một phương án rồi bấm *Kiểm tra đáp án* (hoặc `Enter`). Sau khi kiểm tra: báo đúng/sai, hiện đáp án đúng (và phương án đã chọn nếu sai), giải thích tiếng Việt theo từng kỹ năng (ngữ pháp: quy tắc; từ vựng: nghĩa và cách dùng; giao tiếp: vì sao phù hợp tình huống; đọc hiểu: căn cứ trong bài – đoạn căn cứ được tô vàng trong bài đọc), và mục *Vì sao các phương án khác chưa đúng* khi có dữ liệu. Đáp án bị khoá sau khi kiểm tra; chỉ đổi được bằng nút *Làm lại*. Tiến độ lưu theo ID câu hỏi trong `localStorage`.
- **Exam Mode:** đề nhanh 20 / 40 / 50 câu từ bộ lọc hiện tại (có thể đặt giới hạn thời gian) hoặc làm một đề đã soạn. Trước khi nộp: không hiện đáp án đúng, đúng/sai hay giải thích; được đổi đáp án. Hết giờ thì bài tự nộp (kể cả khi tải lại trang sau giờ hết hạn). Sau khi nộp: điểm, số câu đúng / sai / bỏ trống, thời gian, kết quả theo kỹ năng và trình độ, danh sách câu hỏi (đáp án đã chọn và đáp án đúng – bấm vào để xem lại giải thích), lọc câu sai & bỏ trống. Lịch sử 30 bài thi gần nhất xem trong *Statistics*.
- **Exam Builder (Soạn đề thi):**
  - Cấu hình: tên đề, số câu, thời gian, trình độ (A1 / A2 / A1–A2), độ khó, loại câu hỏi, chủ đề (theo kỹ năng → chủ đề chi tiết), chọn ngẫu nhiên hoặc thủ công, phân bổ số câu theo kỹ năng / loại câu / chủ đề.
  - Kiểm tra trước khi tạo: báo số câu hiện có, chỉ ra nhóm thiếu câu và đưa gợi ý điều chỉnh. Gợi ý **chỉ được áp dụng khi người dùng bấm chọn**; không bao giờ tự tạo câu hỏi hay tự sửa cấu hình.
  - Câu đọc hiểu được chọn theo cụm cùng bài đọc và luôn xếp liền nhau, kèm bài đọc khi làm bài.
  - Xem trước đề (bấm vào câu để xem đáp án, giải thích), cơ cấu theo kỹ năng / trình độ / độ khó / chủ đề / loại câu; xoá, thay thế (cùng kỹ năng, ưu tiên cùng chủ đề), thêm câu từ ngân hàng (tìm theo ID, nội dung, chủ đề, trình độ) hoặc thêm cả bài đọc. Không thể thêm một câu hai lần.
  - Lưu đề để dùng lại; mở / sửa, lưu thành đề mới, nhân bản, xoá đề đã lưu. Đề đã lưu (`ent104.savedPapers.v1`) tách biệt với kết quả làm bài (`ent104.examHistory.v1`).
- **Bộ lọc:** kỹ năng, trình độ (A1 / A2 / A1-A2), chủ đề, trạng thái làm bài (chưa làm / đúng / sai); nút *Review wrong answers* để ôn lại câu sai.
- **Tìm kiếm** theo nội dung (câu hỏi, đáp án, giải thích, tên bài đọc) hoặc theo ID (vd. `GRAM-A1-0001`).
- **Bài đọc** hiển thị ở khung riêng phía trên câu hỏi (có thể thu gọn); mỗi bài đọc chỉ lưu một lần trong `data/reading-passages.json`.
- Mọi con số (tổng câu, số câu theo nhóm, bản đồ câu hỏi, điểm) đều tính từ dữ liệu – thêm/bớt câu hỏi không cần sửa giao diện.
- **Giao diện Sáng / Tối:** nút ở góc phải thanh tiêu đề, chọn *Sáng*, *Tối* hoặc *Theo hệ thống* (mặc định); lựa chọn được lưu trong `localStorage` (`ent104.theme`).
- Phím tắt: `1`–`4` hoặc `A`–`D` chọn đáp án, `Enter` kiểm tra đáp án (Practice), `←` `→` chuyển câu, `/` tìm kiếm, `Esc` đóng hộp thoại.

## Cấu trúc thư mục

```
index.html                      Giao diện (chỉ HTML)
css/theme.css                   Bảng màu dạng biến CSS cho chế độ Sáng và Tối
css/styles.css                  CSS bổ sung ngoài Tailwind
js/tailwind-config.js           Cấu hình Tailwind (font, màu đọc từ biến CSS), đặt chế độ tối trước khi hiển thị
js/theme.js                     Menu chọn giao diện Sáng / Tối / Theo hệ thống
js/storage.js                   Đọc / ghi localStorage an toàn
js/questionService.js           Tải dữ liệu (JSON → bundle), lọc, tìm kiếm, tìm đoạn căn cứ trong bài đọc
js/quizService.js               Trạng thái luyện tập / bài thi (giới hạn thời gian, tự nộp), lịch sử kết quả
js/statisticsService.js         Tính thống kê
js/examBuilderService.js        Soạn đề: kiểm tra cấu hình, chọn câu, thêm / xoá / thay, lưu đề
js/examBuilderView.js           Giao diện Exam Builder
js/app.js                       Hiển thị Practice / Exam và xử lý sự kiện
data/questions.json             Ngân hàng câu hỏi (nguồn dữ liệu chính)
data/reading-passages.json      Các bài đọc
data/question-bank.bundle.js    Bản đóng gói tự sinh từ 2 file JSON (dùng khi mở bằng file://)
scripts/validate-questions.js   Kiểm tra dữ liệu
scripts/test-features.js        Kiểm thử logic Practice / Exam / Exam Builder (npm test)
scripts/build-bundle.js         Tạo lại bundle từ JSON
scripts/serve.js                Web server tĩnh
scripts/generate-question-bank.js, scripts/bank/*, scripts/lib/*
                                Mã nguồn đã dùng để soạn ngân hàng câu hỏi ban đầu
```

## Sửa / thêm câu hỏi

1. Sửa trực tiếp `data/questions.json` (và `data/reading-passages.json` nếu là bài đọc).
2. Chạy `npm run build` – tạo lại `data/question-bank.bundle.js` rồi kiểm tra toàn bộ dữ liệu.
3. Nếu chỉ muốn kiểm tra: `npm run validate` (thêm `-- --verbose` để xem danh sách cảnh báo).

`scripts/generate-question-bank.js` (`npm run generate`) sinh lại toàn bộ dữ liệu từ `scripts/bank/` và **sẽ từ chối ghi đè** `data/questions.json` nếu không có `--force` – vì sau khi sinh, file JSON mới là nguồn dữ liệu chính và có thể đã được chỉnh tay.

### Cấu trúc một câu hỏi

```json
{
  "id": "GRAM-A1-0001",
  "skill": "grammar",
  "type": "completion",
  "category": "Verb BE",
  "level": "A1",
  "difficulty": "easy",
  "unit": null,
  "source": "general_a1_a2",
  "question": "Where ______ your new English teacher from?",
  "options": ["be", "are", "is", "am"],
  "answer": 2,
  "explanation": "…",
  "tags": ["verb-be"],
  "status": "ai_reviewed"
}
```

| Trường | Giá trị |
|---|---|
| `id` | `<NHÓM>-<TRÌNH ĐỘ>-<số 4 chữ số>`; nhóm: `GRAM`, `VOC`, `COMM`, `READ`, `CERR`, `WRIT`; trình độ: `A1`, `A2`, `A12` (= A1-A2) |
| `skill` | `grammar`, `vocabulary`, `communication`, `reading`, `completion_error`, `writing` |
| `type` | `completion` (điền vào chỗ trống), `error` (tìm lỗi sai), `choice` (chọn đáp án), `ordering` (sắp xếp) |
| `level` | `A1`, `A2`, `A1-A2` |
| `difficulty` | `easy`, `medium`, `hard` |
| `answer` | chỉ số đáp án đúng trong `options` (0–3) |
| `passageId` | (chỉ câu đọc hiểu) ID bài đọc trong `reading-passages.json` |
| `correction` | (chỉ câu tìm lỗi) cách sửa phần sai |
| `optionNotes` | (tuỳ chọn) `{ "<phương án sai>": "<vì sao không phù hợp>" }` – hiện trong mục *Vì sao các phương án khác chưa đúng*. Hiện có ở 390 câu (ngữ pháp, từ vựng, hoàn thành câu), sinh từ bảng ghi chú trong `scripts/lib/option-notes.js`. Câu tìm lỗi sai tự ghi chú các phần còn lại là “dùng đúng”. |
| `reviewNote` | ghi chú khi câu hỏi gốc đã bị chỉnh sửa / cần xem lại |

### Ý nghĩa `status`

| Status | Ý nghĩa |
|---|---|
| `reviewed` | Giáo viên đã duyệt. **Hiện chưa có câu nào.** Chỉ người thật được gán trạng thái này. |
| `ai_reviewed` | Đã qua kiểm tra tự động **và** được AI đọc rà soát từng câu (đáp án, phương án nhiễu, giải thích). Không thay thế cho việc giáo viên duyệt. |
| `auto_validated` | Mới chỉ qua kiểm tra tự động (script). |
| `needs_review` | Câu gốc đã được chỉnh sửa hoặc còn điểm cần giáo viên xác nhận – xem `reviewNote`. |
| `needs_ent104_verification` | Dành cho câu cần đối chiếu riêng với tài liệu ENT104. |

### Quy tắc phân trình độ

- Ngữ pháp và đọc hiểu: trình độ gắn theo điểm ngữ pháp / độ khó bài đọc khi soạn.
- Từ vựng, giao tiếp, hoàn thành câu & tìm lỗi, sắp xếp & viết: câu A1 có độ khó `medium`/`hard` được xếp vào nhóm chuyển tiếp `A1-A2`.

## Kiểm tra dữ liệu (`scripts/validate-questions.js`)

Lỗi (làm script thất bại): thiếu trường / sai giá trị cho phép; ID trùng hoặc sai định dạng, tiền tố không khớp kỹ năng/trình độ; không đúng 4 phương án hoặc có phương án trùng; `answer` không hợp lệ; giải thích quá ngắn; câu điền khuyết không có chỗ trống; câu tìm lỗi có phần gạch chân (A)–(D) không khớp phương án hoặc giải thích chỉ sai phần khác đáp án; câu sắp xếp có phương án không dùng đúng các từ / dòng đã cho; `passageId` không tồn tại; câu hỏi trùng hoặc gần trùng ≥ 85% (so sánh cả câu hoàn chỉnh sau khi điền đáp án); bundle không khớp JSON.

Lỗi thêm cho `optionNotes`: khoá không phải phương án, trỏ vào đáp án đúng, hoặc ghi chú quá ngắn.

Cảnh báo: gần trùng 70–85%, giải thích ngắn không nhắc tới đáp án, bài đọc không có câu hỏi, câu đọc hiểu chi tiết (Detail) mà giải thích không trích nguyên văn được đoạn nào trong bài đọc.

## Kiểm thử chức năng (`npm test`)

`scripts/test-features.js` chạy trên ngân hàng 1.000 câu thật (localStorage giả lập), gồm 10 nhóm: phản hồi Practice đúng/sai và khoá đáp án; Exam không lộ kết quả trước khi nộp; xem lại đáp án và giải thích sau khi nộp; đề ngẫu nhiên đúng số câu / phân bổ / tiêu chí (lặp hàng trăm lần, gồm đề mẫu 40 câu = 15 Grammar + 10 Vocabulary + 5 Communication + 10 Reading); thêm / xoá / thay câu thủ công; không trùng câu; báo thiếu câu mà không tự sửa cấu hình; lưu – mở lại – sửa – nhân bản – xoá đề; điểm và thống kê, hết giờ tự nộp; tương thích ngân hàng 1.000 câu. Phần hiển thị (ẩn đáp án trong Exam, tô căn cứ bài đọc, giao diện Exam Builder) được kiểm tra thủ công trên trình duyệt.

## Thống kê hiện tại

| | Số câu |
|---|---|
| Tổng | 1.000 (30 bài đọc) |
| Grammar | 300 |
| Vocabulary | 200 |
| Communication | 150 |
| Reading | 150 |
| Completion & Error | 100 |
| Ordering & Writing | 100 |
| A1 / A2 / A1-A2 | 468 / 335 / 197 |
| `ai_reviewed` / `needs_review` / `reviewed` | 988 / 12 / 0 |

Số câu A2 (335) thấp hơn mục tiêu 400 vì câu hỏi không bị nâng trình độ chỉ để đủ chỉ tiêu.
