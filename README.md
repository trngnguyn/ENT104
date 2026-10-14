# English A1–B1 Practice – Ngân hàng câu hỏi

Ứng dụng web tĩnh để luyện tập và thi thử tiếng Anh trình độ A1–B1, kèm ngân hàng **1.300 câu hỏi** lưu ở dạng JSON: 1.000 câu A1–A2 và 300 câu B1.

> **Lưu ý về ENT104:** toàn bộ câu hỏi là nội dung tiếng Anh tổng quát – A1–A2 (`source: "general_a1_a2"`) và B1 (`source: "general_b1"`), đều có `unit: null`.
> Nội dung **chưa được đối chiếu** với đề cương chính thức của học phần ENT104 – Trường Đại học FPT. Không có câu nào được gán unit, bài học, giáo trình hay tỷ trọng đề thi.

## Chạy ứng dụng

Cách 1 – qua web server (khuyến nghị, cần Node.js ≥ 18, không cần cài thêm gói):

```bash
npm start            # hoặc: node scripts/serve.js
# mở http://localhost:8080
npm run start:demo   # như trên nhưng Writing chạy chế độ DEMO (không gọi AI, không cần khoá)
```

Máy chủ mặc định chỉ nghe trên `127.0.0.1`. Muốn máy khác trong mạng truy cập: đặt `HOST=0.0.0.0` trong `.env`.

Cách 2 – mở trực tiếp `index.html` bằng trình duyệt (file://). Khi đó trình duyệt không cho đọc file JSON nên ứng dụng tự chuyển sang dùng `data/question-bank.bundle.js`. Tính năng **Writing không dùng được** ở cách này vì cần máy chủ để gọi AI.

### Bật chấm Writing bằng AI

1. Sao chép `.env.example` thành `.env` (file `.env` đã nằm trong `.gitignore`).
2. Điền `AI_API_KEY` và `AI_MODEL`. `AI_BASE_URL` mặc định là OpenAI; có thể đổi sang dịch vụ có API tương thích OpenAI Chat Completions (Google Gemini, OpenRouter, Groq, Ollama chạy trên máy – Ollama không cần khoá). Ví dụ trong `.env.example`.
3. Kiểm tra cấu hình bằng `npm run check-ai` (chấm thử một bài mẫu, không in khoá). Thử nhanh nhiều model: `npm run check-ai -- gemini-3.5-flash:low gemini-3.5-flash-lite:low`.
4. Chạy lại `npm start`. Dòng log `Writing: chấm bằng <model> …` cho biết đã bật; trong tab Writing có nhãn *AI sẵn sàng*.

Model miễn phí hay bị quá tải (HTTP 503) hoặc ngừng hỗ trợ (vd. `gemini-2.5-flash` không còn cho người dùng mới). Vì vậy nên khai báo `AI_FALLBACK_MODELS`: khi model chính quá tải / không tồn tại / quá thời gian, máy chủ tự chuyển sang model dự phòng (tối đa 4 lượt gọi cho một bài). Với Gemini, đặt `AI_REASONING_EFFORT=low` để chấm nhanh (~7–25 giây).

Nếu nhà cung cấp không hỗ trợ `response_format: json_object`, đặt `AI_JSON_MODE=false`; nếu model yêu cầu `max_completion_tokens`, đặt `AI_MAX_TOKENS_FIELD=max_completion_tokens`.

### Triển khai Writing với GitHub Pages (Cloudflare Worker)

GitHub Pages chỉ phục vụ file tĩnh nên không chạy được backend, và **không được đặt khoá AI trong mã frontend** (mọi file trên Pages ai cũng tải được). Cách triển khai: trang vẫn ở GitHub Pages, phần chấm bài chạy trên **Cloudflare Workers** (gói miễn phí), khoá AI lưu dạng secret của Cloudflare.

1. Lấy khoá Gemini miễn phí tại [Google AI Studio](https://aistudio.google.com/) (*Get API key*).
2. Tạo tài khoản [Cloudflare](https://dash.cloudflare.com/sign-up) (miễn phí).
3. Kiểm tra `wrangler.toml` (ở thư mục gốc): `ALLOWED_ORIGINS` là domain GitHub Pages (chỉ phần domain, không có tên repo – hiện là `https://trngnguyn.github.io`). Có thể đổi `AI_MODEL`, `AI_FALLBACK_MODELS` và các giới hạn ở đây.
4. Trong thư mục gốc của dự án, chạy:

   ```bash
   npx wrangler login                    # mở trình duyệt để đăng nhập Cloudflare
   npx wrangler secret put AI_API_KEY    # dán khoá Gemini khi được hỏi
   npx wrangler deploy                   # in ra địa chỉ dạng https://ent104-writing.<tài-khoản>.workers.dev
   ```

5. Mở `js/app-config.js`, điền địa chỉ vừa nhận (hiện là `https://ent104-writing.super-heart-6433.workers.dev/`), rồi commit và push lên GitHub như bình thường.
6. Kiểm tra: mở trang GitHub Pages → tab **Writing** phải hiện nhãn *AI sẵn sàng • gemini-…*. Mở `https://ent104-writing.<tài-khoản>.workers.dev/api/writing/status` cũng phải thấy `"enabled": true`.

Lưu ý:
- Sửa đề trong `data/writing-tasks.json` thì phải chạy lại `npx wrangler deploy` (Worker đóng gói đề lúc deploy để tự kiểm tra `taskId`).
- **Mật khẩu vào Writing:** đặt / đổi bằng `npx wrangler secret put WRITING_ACCESS_CODE` (xoá: `npx wrangler secret delete WRITING_ACCESS_CODE`). Máy chủ kiểm tra mật khẩu ở mọi lần chấm bài – trang web chỉ hiện ô nhập, mật khẩu không nằm trong mã nguồn công khai. Nhập đúng một lần thì trình duyệt nhớ; đổi mật khẩu thì học sinh phải nhập lại. Sai 10 lần trong 15 phút thì IP đó bị khoá tạm thời. Khi chạy `npm start`, đặt `WRITING_ACCESS_CODE` trong `.env`.
- Đổi khoá: chạy lại `npx wrangler secret put AI_API_KEY`. Xem log lỗi chấm bài: `npx wrangler tail`.
- Lần đầu deploy, wrangler yêu cầu đăng ký subdomain `workers.dev` (miễn phí) – phải chạy `npx wrangler deploy` trong terminal và trả lời `y`.
- Tự deploy khi `git push`: trên Cloudflare, mở Worker `ent104-writing` → **Settings → Build** → kết nối repo GitHub, branch `main`, **Root directory để trống**, Build command để trống, Deploy command `npx wrangler deploy`. Nhờ `wrangler.toml` ở thư mục gốc, bản build chỉ deploy Worker chấm bài (không đưa cả repo lên thành site tĩnh); secret `AI_API_KEY` giữ nguyên.
- Lỗi `User location is not supported` từ Gemini: Worker đang chạy ở khu vực Google chặn (vd. Hong Kong). `wrangler.toml` đã ghim Worker chạy ở Mỹ bằng `[placement] region`.
- `js/app-config.js` chỉ dùng URL Worker khi trang chạy trên `*.github.io`; chạy `npm start` ở máy vẫn dùng API cùng máy chủ.
- Giới hạn tần suất trên Worker được đếm trong bộ nhớ của từng phiên bản Worker nên chỉ mang tính tương đối; hạn mức thật sự do Gemini áp dụng cho khoá. CORS chỉ ngăn **trang web khác** dùng API qua trình duyệt, không ngăn người cố tình gọi trực tiếp bằng công cụ – vì vậy đừng dùng khoá có gắn thanh toán nếu không cần.
- Gói miễn phí của Gemini có thể dùng dữ liệu gửi lên để cải thiện sản phẩm – nhắc học sinh không viết thông tin cá nhân nhạy cảm.
- Chạy thử Worker trên máy (không cần khoá): `npx wrangler dev --var AI_PROVIDER:mock --var ALLOWED_ORIGINS:http://localhost:8080`.

Ứng dụng dùng Tailwind CSS, Font Awesome và font Inter qua CDN nên cần kết nối Internet để hiển thị đúng giao diện.

## Tính năng

- **Practice Mode:** chọn một phương án rồi bấm *Kiểm tra đáp án* (hoặc `Enter`). Sau khi kiểm tra: báo đúng/sai, hiện đáp án đúng (và phương án đã chọn nếu sai), giải thích tiếng Việt theo từng kỹ năng (ngữ pháp: quy tắc; từ vựng: nghĩa và cách dùng; giao tiếp: vì sao phù hợp tình huống; đọc hiểu: căn cứ trong bài – đoạn căn cứ được tô vàng trong bài đọc), và mục *Vì sao các phương án khác chưa đúng* khi có dữ liệu. Đáp án bị khoá sau khi kiểm tra; chỉ đổi được bằng nút *Làm lại*. Tiến độ lưu theo ID câu hỏi trong `localStorage`.
- **Exam Mode:** đề nhanh 20 / 40 / 50 câu từ bộ lọc hiện tại (có thể đặt giới hạn thời gian) hoặc làm một đề đã soạn. Trước khi nộp: không hiện đáp án đúng, đúng/sai hay giải thích; được đổi đáp án. Hết giờ thì bài tự nộp (kể cả khi tải lại trang sau giờ hết hạn). Sau khi nộp: điểm, số câu đúng / sai / bỏ trống, thời gian, kết quả theo kỹ năng và trình độ, danh sách câu hỏi (đáp án đã chọn và đáp án đúng – bấm vào để xem lại giải thích), lọc câu sai & bỏ trống. Lịch sử 30 bài thi gần nhất xem trong *Statistics*.
- **Exam Builder (Soạn đề thi):**
  - Cấu hình: tên đề, số câu, thời gian, trình độ (A1 / A2 / A1–A2 / B1), độ khó, loại câu hỏi, chủ đề (theo kỹ năng → chủ đề chi tiết), chọn ngẫu nhiên hoặc thủ công, phân bổ số câu theo kỹ năng / loại câu / chủ đề.
  - Kiểm tra trước khi tạo: báo số câu hiện có, chỉ ra nhóm thiếu câu và đưa gợi ý điều chỉnh. Gợi ý **chỉ được áp dụng khi người dùng bấm chọn**; không bao giờ tự tạo câu hỏi hay tự sửa cấu hình.
  - Câu đọc hiểu được chọn theo cụm cùng bài đọc và luôn xếp liền nhau, kèm bài đọc khi làm bài.
  - Xem trước đề (bấm vào câu để xem đáp án, giải thích), cơ cấu theo kỹ năng / trình độ / độ khó / chủ đề / loại câu; xoá, thay thế (cùng kỹ năng, ưu tiên cùng chủ đề), thêm câu từ ngân hàng (tìm theo ID, nội dung, chủ đề, trình độ) hoặc thêm cả bài đọc. Không thể thêm một câu hai lần.
  - Lưu đề để dùng lại; mở / sửa, lưu thành đề mới, nhân bản, xoá đề đã lưu. Đề đã lưu (`ent104.savedPapers.v1`) tách biệt với kết quả làm bài (`ent104.examHistory.v1`).
- **Writing (luyện viết đoạn văn):** 24 đề (`data/writing-tasks.json`) – mỗi trình độ A1 / A2 / B1 có 4 đoạn văn miêu tả (*descriptive*) và 4 đoạn văn kể chuyện (*narrative*). Yêu cầu chung: **một đoạn văn khoảng 150 từ** (chấp nhận 130–180 từ).
  - Viết bài: bộ đếm từ so với mục tiêu 150 từ, cảnh báo khi thiếu từ / tách nhiều đoạn, bản nháp tự lưu theo từng đề, `Ctrl + Enter` để gửi.
  - Kết quả chia **hai cột** (trên điện thoại xếp dọc):
    - **Bài làm của học sinh** (cột trái, cố định khi cuộn): chế độ *Bài gốc* tô lỗi (hồng = ngữ pháp, tím = từ vựng, có số thứ tự) và chế độ *Bài đã sửa* gạch phần sai, chèn phần sửa ngay sau. Bấm vào lỗi để xem giải thích ở cột phải và ngược lại.
    - **Nhận xét & bài sửa của AI** (cột phải), 5 mục: (1) **tổng quan 4 tiêu chí** – Hoàn thành yêu cầu, Ngữ pháp, Từ vựng, Bố cục & liên kết, mỗi tiêu chí 0–10, điểm tổng là trung bình làm tròn 0,5, kèm nhận xét và điểm tốt; (2) **lỗi ngữ pháp & sửa sai** (gồm cả dấu câu / viết hoa, trật tự từ); (3) **lỗi từ vựng & sửa sai** (gồm cả chính tả, văn phong) – mỗi lỗi có giải thích tiếng Việt; (4) **ngữ pháp & từ vựng gợi ý** để cải thiện bài (cấu trúc + câu ví dụ theo chủ đề, từ / cụm từ + nghĩa); (5) **bài sửa hoàn chỉnh** (giữ ý của người học). Thêm **bài viết tham khảo** ~150 từ (thu gọn).
  - Độ dài được kiểm soát ở máy chủ: đoạn văn dưới 130 từ bị giới hạn điểm *Hoàn thành yêu cầu* (≥ 111 từ: tối đa 7; ≥ 78 từ: tối đa 5; ít hơn: tối đa 3), dài hơn 180 từ: tối đa 8.
  - Lưu 5 lần chấm gần nhất mỗi đề (`localStorage`, khoá `ent104.writing.v1`), xem lại, viết lại từ bài cũ hoặc bản đã sửa. Lịch sử Writing tách biệt với nút *Reset* của Practice / Exam.
  - Điểm là ước lượng của AI theo thang tham khảo của ứng dụng, **không phải tiêu chí hay điểm chính thức của ENT104**; đề Writing cũng là nội dung tổng quát (`general_a1_a2` / `general_b1`, `unit: null`).
- **Bộ lọc:** kỹ năng, trình độ (A1 / A2 / A1-A2 / B1), chủ đề, trạng thái làm bài (chưa làm / đúng / sai); nút *Review wrong answers* để ôn lại câu sai.
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
js/writingService.js            Writing: đếm từ, giới hạn, định vị lỗi, gọi API, bản nháp / lịch sử (dùng chung với server)
js/writingView.js               Giao diện Writing
js/app.js                       Hiển thị Practice / Exam và xử lý sự kiện, chuyển chế độ
data/questions.json             Ngân hàng câu hỏi (nguồn dữ liệu chính)
data/reading-passages.json      Các bài đọc
data/writing-tasks.json         Đề Writing (đoạn văn miêu tả / kể chuyện ~150 từ)
js/app-config.js                Cấu hình frontend: địa chỉ backend Writing (writingApiBase)
server/app.js                   Máy chủ HTTP Node: file tĩnh theo danh sách cho phép + API Writing
server/writing-api.js           API Writing dùng chung cho Node và Cloudflare Worker (kiểm tra đầu vào, CORS, giới hạn)
server/writing-feedback.js      Prompt chấm bài, kiểm tra / làm sạch kết quả AI, chế độ demo
server/ai-client.js             Gọi API dạng OpenAI Chat Completions
server/rate-limit.js            Giới hạn số lần chấm
server/config.js, server/env.js Cấu hình từ biến môi trường / .env
server/load-tasks.js            Đọc đề Writing từ file (Node)
worker/index.js, wrangler.toml  Cloudflare Worker cho bản GitHub Pages (wrangler.toml ở thư mục gốc)
.env.example                    Mẫu cấu hình (sao chép thành .env)
data/question-bank.bundle.js    Bản đóng gói tự sinh từ 2 file JSON (dùng khi mở bằng file://)
scripts/validate-questions.js   Kiểm tra dữ liệu
scripts/test-features.js        Kiểm thử logic Practice / Exam / Exam Builder (npm test)
scripts/test-writing.js         Kiểm thử Writing và máy chủ (npm test, dùng AI giả lập)
scripts/build-bundle.js         Tạo lại bundle từ JSON
scripts/serve.js                Khởi động máy chủ (npm start)
scripts/generate-question-bank.js, scripts/bank/*, scripts/lib/*
                                Mã nguồn đã dùng để soạn ngân hàng câu hỏi ban đầu
                                (câu B1 nằm trong scripts/bank/b1-*.js)
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
| `id` | `<NHÓM>-<TRÌNH ĐỘ>-<số 4 chữ số>`; nhóm: `GRAM`, `VOC`, `COMM`, `READ`, `CERR`, `WRIT`; trình độ: `A1`, `A2`, `A12` (= A1-A2), `B1` |
| `skill` | `grammar`, `vocabulary`, `communication`, `reading`, `completion_error`, `writing` |
| `type` | `completion` (điền vào chỗ trống), `error` (tìm lỗi sai), `choice` (chọn đáp án), `ordering` (sắp xếp) |
| `level` | `A1`, `A2`, `A1-A2`, `B1` |
| `difficulty` | `easy`, `medium`, `hard` (độ khó tương đối trong cùng trình độ) |
| `source` | `general_a1_a2` (câu A1, A2, A1-A2), `general_b1` (câu B1), `ent104_verified` (chỉ dùng khi đã đối chiếu tài liệu ENT104). Phải khớp với `level`; nguồn tổng quát bắt buộc `unit: null`. |
| `answer` | chỉ số đáp án đúng trong `options` (0–3) |
| `passageId` | (chỉ câu đọc hiểu) ID bài đọc trong `reading-passages.json` |
| `correction` | (chỉ câu tìm lỗi) cách sửa phần sai |
| `optionNotes` | (tuỳ chọn) `{ "<phương án sai>": "<vì sao không phù hợp>" }` – hiện trong mục *Vì sao các phương án khác chưa đúng*. Hiện có ở 475 câu (ngữ pháp, từ vựng, hoàn thành câu), sinh từ bảng ghi chú trong `scripts/lib/option-notes.js`. Câu tìm lỗi sai tự ghi chú các phần còn lại là “dùng đúng”. |
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
- Câu B1 được soạn riêng theo các điểm ngữ pháp / chủ đề thường gặp ở trình độ B1 (hiện tại hoàn thành tiếp diễn, quá khứ hoàn thành, câu điều kiện loại 1–3, bị động, mệnh đề quan hệ, câu tường thuật, danh động từ / động từ nguyên mẫu, cụm động từ, kết hợp từ, cấu tạo từ…); không có nhóm chuyển tiếp A2-B1.

## Kiểm tra dữ liệu (`scripts/validate-questions.js`)

Lỗi (làm script thất bại): thiếu trường / sai giá trị cho phép; `source` không khớp `level` (câu hỏi và bài đọc); ID trùng hoặc sai định dạng, tiền tố không khớp kỹ năng/trình độ; không đúng 4 phương án hoặc có phương án trùng; `answer` không hợp lệ; giải thích quá ngắn; câu điền khuyết không có chỗ trống; câu tìm lỗi có phần gạch chân (A)–(D) không khớp phương án hoặc giải thích chỉ sai phần khác đáp án; câu sắp xếp có phương án không dùng đúng các từ / dòng đã cho; `passageId` không tồn tại; câu hỏi trùng hoặc gần trùng ≥ 85% (so sánh cả câu hoàn chỉnh sau khi điền đáp án); bundle không khớp JSON.

Lỗi thêm cho `optionNotes`: khoá không phải phương án, trỏ vào đáp án đúng, hoặc ghi chú quá ngắn.

Cảnh báo: gần trùng 70–85%, giải thích ngắn không nhắc tới đáp án, bài đọc không có câu hỏi, câu đọc hiểu chi tiết (Detail) mà giải thích không trích nguyên văn được đoạn nào trong bài đọc.

## Writing – API và bảo mật

| API | Mô tả |
|---|---|
| `GET /api/writing/status` | `{ enabled, provider, model, message, limits }` – không bao giờ chứa khoá |
| `POST /api/writing/feedback` | Body `{ "taskId": "WT-A1-05", "text": "…" }` → `{ "feedback": { score, maxScore, criteria, corrections, correctedText, modelAnswer, … } }`; lỗi: `{ "error": { code, message } }` |

- **Khoá API chỉ nằm ở máy chủ** (`.env` / biến môi trường); trình duyệt chỉ gửi mã đề và bài viết. Máy chủ chỉ phục vụ `index.html`, `css/`, `js/`, `data/` – mọi file bắt đầu bằng dấu chấm (`.env`, `.git`), mã server, `scripts/`, `package.json` đều trả 404.
- Prompt được dựng ở máy chủ từ đề trong `data/writing-tasks.json` (người dùng không gửi được chỉ dẫn riêng). Bài viết được đặt trong thẻ phân cách và AI được dặn coi đó là dữ liệu cần chấm, không phải lệnh.
- Kiểm tra đầu vào: chỉ nhận JSON (≤ 16 KB), đề phải tồn tại, bài 20–400 từ và ≤ 3.000 ký tự; chặn yêu cầu từ trang khác (`Origin` / `Sec-Fetch-Site`), trừ các domain khai báo trong `ALLOWED_ORIGINS` (CORS – dùng cho trang GitHub Pages).
- Giới hạn chi phí: mặc định 5 lần / phút và 50 lần / ngày mỗi IP, 500 lần / ngày toàn máy chủ, tối đa 4 bài chấm cùng lúc (đổi trong `.env`). Hết thời gian chờ AI sau 60 giây.
- Kết quả AI được kiểm tra trước khi trả về: điểm từng tiêu chí bị kẹp 0–10, **điểm tổng do máy chủ tính**, góp ý sửa lỗi không khớp nguyên văn bài viết bị loại, độ dài chuỗi bị giới hạn; giao diện escape mọi nội dung khi hiển thị.
- Lỗi từ dịch vụ AI chỉ ghi chi tiết ở log máy chủ; người dùng nhận thông báo chung (không lộ khoá hay nội dung lỗi gốc). Log không ghi nội dung bài viết.
- Khi chạy sau reverse proxy, đặt `TRUST_PROXY=true` để giới hạn theo IP thật (`X-Forwarded-For`).

## Kiểm thử chức năng (`npm test`)

`scripts/test-features.js` chạy trên ngân hàng 1.300 câu thật (localStorage giả lập), gồm 10 nhóm: phản hồi Practice đúng/sai và khoá đáp án; Exam không lộ kết quả trước khi nộp; xem lại đáp án và giải thích sau khi nộp; đề ngẫu nhiên đúng số câu / phân bổ / tiêu chí (lặp hàng trăm lần, gồm đề mẫu 40 câu = 15 Grammar + 10 Vocabulary + 5 Communication + 10 Reading); thêm / xoá / thay câu thủ công; không trùng câu; báo thiếu câu mà không tự sửa cấu hình; lưu – mở lại – sửa – nhân bản – xoá đề; điểm và thống kê, hết giờ tự nộp; tương thích ngân hàng 1.300 câu (cơ cấu A1–A2 giữ nguyên, 300 câu B1 đúng nguồn `general_b1`, tạo được đề chỉ gồm câu B1 và bài đọc B1). Phần hiển thị (ẩn đáp án trong Exam, tô căn cứ bài đọc, giao diện Exam Builder) được kiểm tra thủ công trên trình duyệt.

`scripts/test-writing.js` (18 nhóm, gồm cả CORS và chạy thử mã Cloudflare Worker; không gọi AI thật – dùng dịch vụ AI giả lập): ngân hàng đề Writing; đếm từ, giới hạn gửi bài, điểm trần theo độ dài; định vị lỗi theo nguyên từ; làm sạch phản hồi AI và tự tính điểm tổng; prompt tách bài viết khỏi chỉ dẫn; giới hạn tần suất; cấu hình `.env`; máy chủ không lộ `.env` / mã nguồn; kiểm tra đầu vào, chặn gọi chéo trang, giới hạn kích thước; khoá chỉ gửi tới AI và không lộ trong phản hồi / lỗi; chế độ chưa cấu hình và demo; bản nháp và lịch sử.

## Thống kê hiện tại

| | A1–A2 | B1 | Tổng |
|---|---|---|---|
| Tổng | 1.000 (30 bài đọc) | 300 (9 bài đọc) | 1.300 (39 bài đọc) |
| Grammar | 300 | 90 | 390 |
| Vocabulary | 200 | 60 | 260 |
| Communication | 150 | 45 | 195 |
| Reading | 150 | 45 | 195 |
| Completion & Error | 100 | 30 | 130 |
| Ordering & Writing | 100 | 30 | 130 |

- Theo trình độ: A1 / A2 / A1-A2 / B1 = 468 / 335 / 197 / 300.
- `ai_reviewed` / `needs_review` / `reviewed`: 1.288 / 12 / 0 (cả 300 câu B1 đều là `ai_reviewed`).

Số câu A2 (335) thấp hơn mục tiêu 400 vì câu hỏi không bị nâng trình độ chỉ để đủ chỉ tiêu.
