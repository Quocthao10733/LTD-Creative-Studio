# 04 – GOLDEN SAMPLE DATASET TEMPLATE

## Mẫu thu thập bài viết thật để xây LTD Brand Writer

Mục tiêu là tạo một tập dữ liệu có nguồn gốc, có đánh giá biên tập và có thể truy xuất. Đây không phải tập văn bản gom ngẫu nhiên.

---

# 1. Nguồn và quyền sử dụng

Fanpage được Project Owner cung cấp: https://www.facebook.com/longthanhdigitalphotoclub

Chỉ thêm nội dung mà LTD sở hữu hoặc có quyền sử dụng nội bộ. Không sao chép nguyên bài của CLB khác.

Với mỗi bài, lưu:

- URL bài đăng gốc.
- Ngày đăng (nếu biết).
- Người/ban nhập mẫu (có thể lưu role, không nhất thiết lưu tên).
- Xác nhận quyền sử dụng: yes/no/needs_review.
- Có chứa dữ liệu cá nhân không: yes/no.

Nếu nội dung có email, số điện thoại, tên đầy đủ hoặc thông tin riêng tư của thành viên, loại bỏ hoặc ẩn danh trước khi đưa vào kho prompt/retrieval.

# 2. Mẫu metadata cho một bài viết

```json
{
  "sample_id": "LTD-POST-0001",
  "source_url": "https://www.facebook.com/...",
  "published_at": "YYYY-MM-DD",
  "platform": "facebook",
  "content_type": "event_recap",
  "campaign_or_event": "Tên hoạt động nếu có",
  "objective": "Mục tiêu bài đăng",
  "audience": ["members", "public"],
  "confirmed_facts": [
    "Thông tin đã kiểm chứng"
  ],
  "original_text": "Dán caption gốc của LTD ở đây",
  "visual_context": "Mô tả ảnh/video nếu cần; không suy diễn",
  "tone_tags": ["warm", "youthful"],
  "storytelling_pattern": "moment-led",
  "strengths": [
    "Lý do bài này được chọn"
  ],
  "weaknesses": [],
  "quality_tier": "A",
  "approved_for_retrieval": true,
  "rights_confirmed": true,
  "review_notes": "Ghi chú của người duyệt"
}
```

Các tone tag trong ví dụ chỉ minh họa. Chỉ dùng tag sau khi đọc bài thật và thống nhất định nghĩa.

# 3. Biểu mẫu nhập bài

## Thông tin bài viết

- Mã bài:
- URL:
- Ngày đăng:
- Nền tảng:
- Loại bài:
- Chiến dịch/sự kiện:
- Mục tiêu:
- Đối tượng đọc:

## Nội dung và bối cảnh

- Caption gốc:
- Ảnh/video đi kèm mô tả điều gì?
- Dữ kiện quan trọng:
- Những dữ kiện nào chưa thể xác minh?

## Đánh giá

- Điều gì làm bài này tốt?
- Câu/đoạn nào thể hiện rõ giọng LTD?
- Có yếu tố nào cần tránh lặp lại?
- Tier A/B/C/Rejected:
- Người duyệt/ban duyệt:
- Được dùng làm mẫu AI? yes/no/needs review

# 4. Hướng dẫn chọn bài

Mục tiêu đầu tiên: 20 bài đủ tốt và đa dạng. Sau đó mở rộng đến 30–50 bài.

Không chỉ chọn các bài có nhiều lượt tương tác. Chọn bài theo chất lượng nội dung và mức độ đại diện cho thương hiệu.

Gợi ý phân bổ:

| Thể loại | Mục tiêu số lượng |
|---|---:|
| Chào đón/giới thiệu thành viên | 3–5 |
| Recap hoạt động/workshop | 4–6 |
| Tuyển thành viên/thông báo | 2–4 |
| Giới thiệu dự án/chiến dịch | 3–5 |
| Chia sẻ kiến thức nhiếp ảnh | 3–5 |
| Nội dung cộng đồng/hậu trường | 3–5 |

Các nhóm có thể chồng lấp; ưu tiên độ đa dạng.

# 5. Bộ từ điển loại bài

- `member_welcome`
- `member_introduction`
- `recruitment`
- `event_announcement`
- `event_recap`
- `workshop_education`
- `photography_tip`
- `photo_story`
- `project_introduction`
- `campaign`
- `partnership_thanks`
- `internal_announcement`
- `year_end_review`

# 6. Bộ từ điển storytelling pattern

- `moment_led`: mở bằng một khoảnh khắc cụ thể.
- `people_led`: mở bằng một con người/nhóm người.
- `place_led`: mở bằng bối cảnh địa điểm.
- `question_led`: mở bằng một câu hỏi có chủ đích.
- `learning_led`: mở bằng điều vừa học/khám phá.
- `project_led`: mở bằng mục tiêu/hành trình dự án.
- `announcement_led`: mở bằng thông tin trực tiếp.

Đây là nhãn mô tả cấu trúc, không phải công thức bắt buộc.

# 7. Bảng đánh giá bài mẫu 1–5

| Tiêu chí | Câu hỏi |
|---|---|
| Voice fit | Bài có đại diện đúng phong cách LTD không? |
| Naturalness | Đọc có tự nhiên không? |
| Specificity | Có chi tiết cụ thể thay vì lời chung chung không? |
| Story | Mạch kể có rõ và phù hợp không? |
| Accuracy | Thông tin có chính xác không? |
| Readability | Bố cục, nhịp và độ dài có phù hợp không? |
| Usefulness | Có thể dùng làm mẫu cho các bài tương tự không? |

Một bài có thông tin sai không được xếp Tier A dù văn phong hay.

# 8. Mẫu Editorial Feedback

```json
{
  "generation_id": "GEN-0001",
  "sample_id": "LTD-POST-0001",
  "ai_draft": "Bản AI tạo",
  "human_final": "Bản đã được biên tập",
  "edit_types": [
    "remove_cliche",
    "add_verified_detail",
    "change_hook",
    "shorten_sentence",
    "tone_adjustment"
  ],
  "reason_for_edits": "Giải thích vì sao cần sửa",
  "review_rating": 4,
  "approved_as_golden_sample": false,
  "reviewer_role": "content_editor"
}
```

Không đưa nội dung vào Golden Samples tự động. Cần người có quyền duyệt.

# 9. Quy tắc bảo quản dữ liệu

- Không public kho nội bộ nếu chưa được phép.
- Không đưa dữ liệu cá nhân vào prompt không cần thiết.
- Phân quyền truy cập theo role.
- Có thể lưu bài viết ở mức nội dung và metadata, không cần lưu danh tính người tương tác.
- Giữ URL nguồn để truy vết.
- Nếu bài bị gỡ hoặc quyền sử dụng thay đổi, có thể loại khỏi retrieval.
