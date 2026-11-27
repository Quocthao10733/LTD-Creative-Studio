export const WRITING_ANGLES = [
  {
    id: "plainspoken",
    instruction: "Nói thẳng ngay từ đầu: Hook = 1 câu tóm gọn thông điệp chính + 1 chi tiết/con số cụ thể. Ví dụ: 'Sáng nay 5h30, 12 người LTD đã có mặt tại đập hồ Trị An khi trời vẫn còn đen kịt.' Không dựng cảnh, không câu hỏi, không 'Có những...'.",
  },
  {
    id: "real-detail",
    instruction: "Mở bài bằng 1 chi tiết CÓ THẬT trong dữ kiện: tiếng âm thanh, hình ảnh, con số, câu nói. Ví dụ: 'Chỉ nghe tiếng màn trập Sony A7IV ctrica-ctrica đều đều trong sương sớm.' Nếu dữ kiện không có chi tiết → chuyển sang plainspoken.",
  },
  {
    id: "useful-tip",
    instruction: "Hook = 1 mẹo/quy trình thực tế có thể áp dụng ngay. Ví dụ: 'Muốn ảnh bóng người tách nền nét tại quán cà phê góc phố Long Thành? Chỉ cần 1 đèn pin + tường trắng.' Chỉ dùng khi chủ đề là tips/kỹ thuật VÀ có dữ kiện hỗ trợ.",
  },
  {
    id: "point-of-view",
    instruction: "Hook = 1 quan điểm/nhận xét CÓ CĂN CỨ từ dữ kiện. Ví dụ: 'Workshop 3 giờ, 0 slide PowerPoint — chỉ thực hành, mới thấy học nhanh đến thế.' Không bịa ý kiến, không nói thay thành viên.",
  },
  {
    id: "photo-first",
    instruction: "Hook tập trung vào 1 bức ảnh/khoảnh khắc CÓ THẬT trong dữ kiện. Ví dụ: 'Tấm ảnh bình minh hồ Trị An này: ISO 100, f/8, 1/30s, chân máy đặt ngay mép nước.' Không mô tả ảnh chưa có, không dùng từ 'hoàng hôn lung linh' kiểu sáo.",
  },
  {
    id: "behind-the-scenes",
    instruction: "Hook = 1 cảnh hậu trường/quy trình CÓ THẬT. Ví dụ: 'Anh Huy (TECH) dắt 20 bạn đi săn sáng cửa sổ tại studio LTD — mỗi người chỉ được bấm 10 tấm.' Chỉ dùng khi dữ kiện có mô tả quy trình/hành động thực tế.",
  },
  {
    id: "reader-question",
    instruction: "Hook = 1 câu hỏi CỤ THỂ mà người đọc LTD thực sự quan tâm. Ví dụ: 'Làm sao chụp được bóng người tách nền nét mà không cần studio?' Không hỏi câu tương tác sáo: 'Bạn có thích chụp ảnh không?', 'Agree không?'.",
  },
  {
    id: "short-note",
    instruction: "Viết như ghi chú nhắn tin cho bạn CLB: ngắn, gọn, thẳng. Hook = thông tin chính. Ví dụ: 'CLB tuyển 15 bạn Gen 2026, không cần có máy, chỉ cần thích chụp. Form đăng ký trong bio.' Không bài học, không cảm động, không CTA hụi hụi.",
  },
  {
    id: "mini-story",
    instruction: "Kể 1 sự việc THẬT có nhân vật, hành động, kết quả. Hook mở đầu bằng hành động. Ví dụ: 'Anh Khang (TECH) test setup portrait 3 phút tại Highland Coffee Long Thành — ra tấm ảnh tách nền nét như studio.' Không bịa nhân vật, không tạo kịch tính giả.",
  },
  {
    id: "community-invite",
    instruction: "Hook = lời mời THỰC TẾ, rõ ràng, có lợi ích/địa điểm/thời gian cụ thể. Ví dụ: 'Thứ 7 tuần sau 5h30 sáng, LTD phototrip hồ Trị An — free joining, chỉ cần mang máy và nước uống.' Không tạo khan hiếm giả, không hứa hẹn nếu chưa xác nhận.",
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
