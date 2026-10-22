/* =========================================================
   [Admin] main.jsx — 운영자 사이트 시작 (admin.html)
   ---------------------------------------------------------
   사용자 앱(index.html, src/main.jsx)과 완전히 따로예요. 앱 화면 코드를 쓰지 않아요
   ========================================================= */

import { createRoot } from "react-dom/client";
import "../../styles/admin.css";
import { AdminApp } from "./AdminApp.jsx";
import { AdminService } from "./AdminService.js";

import { TEXT } from "./adminText.js";

document.title = TEXT.siteTitle;   // 앱 글자 파일(i18n)이 탭 제목을 "우르르"로 바꿔서, 운영자 사이트 이름으로 다시
const service = new AdminService(import.meta.env);
createRoot(document.getElementById("admin")).render(<AdminApp service={service} />);
