export const WRITING_ANGLES = [
  {
    id: "plainspoken",
    instruction: "Nói thẳng điều cần nói ngay từ đầu; không dựng cảnh mở bài.",
  },
  {
    id: "real-detail",
    instruction: "Bắt đầu từ một chi tiết có thật trong dữ kiện; nếu không có thì không tự tạo chi tiết.",
  },
  {
    id: "useful-tip",
    instruction: "Ưu tiên một điều hữu ích người đọc có thể áp dụng; chỉ dùng khi chủ đề có cơ sở.",
  },
  {
    id: "point-of-view",
    instruction: "Dùng một nhận xét hoặc góc nhìn riêng có căn cứ; không giả làm ý kiến của thành viên.",
  },
  {
    id: "photo-first",
    instruction: "Đặt bức ảnh/khoảnh khắc nhìn thấy được làm trọng tâm; không tự mô tả ảnh chưa được cung cấp.",
  },
  {
    id: "behind-the-scenes",
    instruction: "Kể về cách làm hoặc hậu trường chỉ khi người dùng đã cung cấp dữ kiện thật.",
  },
  {
    id: "reader-question",
    instruction: "Mở bằng một câu hỏi cụ thể người đọc có thể thật sự quan tâm; tránh câu hỏi câu tương tác sáo.",
  },
  {
    id: "short-note",
    instruction: "Viết như một ghi chú ngắn, gọn; không cần bài học cuộc sống hay kết luận cảm động.",
  },
  {
    id: "mini-story",
    instruction: "Dùng nhịp kể chuyện ngắn chỉ khi có sự việc thật; không bịa nhân vật, lời thoại hoặc diễn biến.",
  },
  {
    id: "community-invite",
    instruction: "Tập trung vào lời mời tham gia rõ ràng, không tạo khan hiếm hoặc hứa hẹn nếu chưa có dữ kiện.",
  },
] as const;

const WRITING_ANGLE_INDEX_KEY = "LTD_WRITING_ANGLE_INDEX";

export type WritingAngleId = (typeof WRITING_ANGLES)[number]["id"];

export function getNextWritingAngle(): WritingAngleId {
  if (typeof window === "undefined") {
    return WRITING_ANGLES[0].id;
  }

  const savedIndex = Number(window.localStorage.getItem(WRITING_ANGLE_INDEX_KEY) || "0");
  const index = Number.isInteger(savedIndex) && savedIndex >= 0
    ? savedIndex % WRITING_ANGLES.length
    : 0;
  const nextIndex = (index + 1) % WRITING_ANGLES.length;
  window.localStorage.setItem(WRITING_ANGLE_INDEX_KEY, String(nextIndex));

  return WRITING_ANGLES[index].id;
}

export function isWritingAngleId(value: unknown): value is WritingAngleId {
  return WRITING_ANGLES.some((angle) => angle.id === value);
}
