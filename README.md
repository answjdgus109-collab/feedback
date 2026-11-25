# CLASS FEEDBACK

수업 만족도 조사 웹앱 (HTML/CSS/JS + Supabase).

1. Supabase SQL Editor에서 `supabase.sql` 실행
2. Supabase Auth 설정: 회원가입 비활성화(Allow new users to sign up OFF), 익명 로그인 OFF
3. Dashboard → Authentication → Users → Add user 로 관리자 생성
4. Vercel 환경변수: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (빌드 시 `public/config.js` 생성)
