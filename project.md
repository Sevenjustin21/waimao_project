# WAIMO 椤圭洰鍏ㄦ櫙鏂囨。

> 鏇存柊鏃堕棿锛?026-01-31銆傛湰鏂囬潰鍚戦渶瑕佸揩閫熺悊瑙ｄ笌鎺ユ墜 E:\Trae\workspace\waimao 澶栬锤鐙珛绔欓」鐩殑寮€鍙戙€佽繍缁翠笌浜у搧鍚屽锛岃鐩栨妧鏈爤銆佹灦鏋勩€佹枃浠剁敤閫斻€佸叧閿祦绋嬩笌鑴氭湰銆?

## 1. 椤圭洰姒傝堪

- **瀹氫綅**锛氶潰鍚戞捣澶?B2B 閲囪喘鍟嗙殑宸ヤ笟绱у浐浠剁嫭绔嬬珯锛屽寘鍚惀閿€钀藉湴椤点€佷骇鍝佺洰褰曘€佽鎯呴〉銆佽鐩橈紙RFQ锛夋祦绋嬩互鍙婂悗鍙扮鐞嗭紙浜у搧銆佽鐩樸€佺郴缁熻缃級銆?
- **鏍稿績鏁版嵁婧?*锛欴irectus 10 浣滀负鍐呭涓庝笟鍔′富搴擄紝鏁版嵁鎸佷箙鍖栧湪 PostgreSQL 16锛屼腑闂撮€氳繃 Prisma 缁存姢闄勫姞琛紙app_users銆乪mail_settings銆乸roduct_images锛夈€?
- **鎼滅储**锛歁eilisearch v1.6 淇濆瓨鎵佸钩鍖栫殑浜у搧绱㈠紩锛屾敮鎸?faceted search銆佸垎绫汇€佽鏍肩瓫閫変笌鍒嗛〉銆?
- **鍓嶇妗嗘灦**锛歂ext.js 14 App Router + React 18 + TailwindCSS 3锛汚pp Router 鐩綍鍒嗕负 `(marketing)`銆乣(shop)`銆乣(admin)` 鍜?API Routes銆?
- **璁よ瘉鎺堟潈**锛歂extAuth Credentials Provider + Prisma 瀛樺偍鍚庡彴/鐢ㄦ埛璐﹀彿锛宮iddleware 闄愬埗 `/admin` 浠呴檺绠＄悊鍛樸€?
- **閭欢涓庡畨鍏?*锛歂odemailer 閫氳繃鍚庡彴閰嶇疆鐨?SMTP 鍙戦€佽鐩橀€氱煡锛宍/api/inquiries` 鍏峰铚滅綈銆両P/Email 澶氱骇闄愭祦銆丠TML 杞箟涓?requestId 璁板綍锛涙敞鍐?鐧诲綍鍚屾牱鍚敤 honeypot銆佹渶灏忓仠鐣欐椂闀夸笌 NextAuth 闄愭祦銆?
- **鍥剧墖涓庤祫浜?*锛歚/api/assets/[id]` 鎻愪緵 Directus 鏂囦欢浠ｇ悊锛屽苟缁撳悎 `product_images` 琛ㄥ疄鐜板鍥捐疆鎾€佸悗鍙板皝闈€佸墠鍙扮敾寤娿€?

## 2. 鎶€鏈爤鎬昏

| 灞傜骇 | 涓昏鎶€鏈?| 浣滅敤涓庡娉?|
| --- | --- | --- |
| Web 妗嗘灦 | Next.js 14锛圓pp Router锛夈€丷eact 18銆乀ypeScript 5 | 钀ラ攢椤点€佸簵閾洪〉銆佸悗鍙伴〉涓?API Routes 鍧囧湪鍚屼竴 Next 瀹炰緥涓繍琛岋紝榛樿寮€鍚?`force-dynamic` 浠ュ疄鏃惰鍙?Directus銆?|
| UI / 鏍峰紡 | TailwindCSS 3銆佸師瀛愬寲 class銆丠eadless UI 椋庢牸缁勪欢 | `globals.css` 鎻愪緵 reset锛岀粍浠跺鏁颁娇鐢ㄥ搷搴斿紡 class銆?|
| 鐘舵€佷笌浜や簰 | React Hooks銆乣useTransition`銆乣useRouter`銆乣useSearchParams` | 鎼滅储杩囨护鍣ㄣ€丷FQ 琛ㄥ崟銆佸悗鍙拌〃鍗?涓婁紶鍧囦緷璧栥€?|
| 璁よ瘉涓庢巿鏉?| NextAuth Credentials Provider銆乣src/middleware.ts` | Prisma `app_users` 淇濆瓨閭+鍝堝笇瀵嗙爜锛沵iddleware 寮哄埗 `/admin/*` 浠呯鐞嗗憳鍙闂€?|
| 鏁版嵁璁块棶 | Directus SDK (`@directus/sdk`)銆丳risma Client 5銆乣node-fetch` | Directus 璐熻矗浜у搧/鍒嗙被/灞炴€?璇㈢洏锛孭risma 璐熻矗鐢ㄦ埛銆侀偖浠惰缃€佷骇鍝佸浘搴撶瓑杈呭姪鏁版嵁銆?|
| 鎼滅储 | Meilisearch JS SDK 0.40 | `src/lib/meilisearch.ts` 璐熻矗绱㈠紩绠＄悊銆佹牸寮忚浆鎹€佺瓫閫夎娉曚笌 REST 鎼滅储 API銆?|
| 閭欢 | Nodemailer 7 | 璇㈢洏鍒涘缓鍚庡彂閫侀€氱煡锛涘悗鍙?`/admin/settings/email` 鍙厤缃笌娴嬭瘯 SMTP銆?|
| 涓婁紶涓庤祫浜?| Directus Files API銆丯ext Image锛坮emotePatterns锛夈€佽嚜寤?`/api/assets` 浠ｇ悊 | 瑙ｅ喅 Directus 403 闂骞剁粺涓€ CDN/CDN-less 鍦板潃锛涘墠鍚庡彴缁勪欢鍧囬€氳繃 `NEXT_PUBLIC_ASSET_BASE_URL` 璇诲彇銆?|
| ��ȫ | �Զ����������� (`src/lib/rate-limit.ts`)��Upstash Redis����ѡ�����۹��ֶΡ�`DIRECTUS_WEBHOOK_SECRET`��`withSecurityContext` / Security Contract (`npm run security:contract`) | ѯ���� webhook ���м�Ȩ��RFQ �ӿ�֧�ֲַ�ʽ������һ���㣬���� `/api/admin/**`��`/api/reindex` �� `/api/inquiries/[id]` �ȿ����� routes ��ͳһע�� requestId / session / IP �����ڼ������� audit �� rate limit ��չ��
| DevOps | Docker Compose銆乀SX銆丒SLint銆乀ypeScript銆丳risma Migrate | `docker-compose.yml` 鎷夎捣 Postgres/Redis/Meilisearch/Directus锛沗scripts/*.ts` 瀹屾垚 init銆乻eed銆佸悓姝ヤ笌鍥炲～銆?|

## 3. 绯荤粺鏋舵瀯涓庢牳蹇冩暟鎹祦

```
娴忚鍣?瀹㈡埛/绠＄悊鍛?
   鈹?
   鈹?Next.js App Router (钀ラ攢 + 搴楅摵 + 鍚庡彴 + API)
   鈹?   鈹溾攢 鍓嶅彴椤甸潰璇诲彇 Meilisearch锛坰earchProducts锛?
   鈹?   鈹溾攢 鍚庡彴/鑴氭湰閫氳繃 Directus SDK 绠＄悊浜у搧銆佸垎绫汇€佸睘鎬?
   鈹?   鈹溾攢 Prisma 缁存姢 app_users / email_settings / product_images
   鈹?   鈹溾攢 Nodemailer 鍙戦€?RFQ 閫氱煡
   鈹?   鈹斺攢 /api/assets 浠ｇ悊 Directus 鏂囦欢
   鈹?
Docker Compose 鈫?Postgres + Directus + Redis + Meilisearch
```

鍏抽敭娴佺▼锛?
1. **浜у搧绠＄悊**锛氱鐞嗗憳鍦?`/admin/products` 閫氳繃 ProductForm 涓婁紶 Directus 璧勪骇銆佸啓鍏?`products`锛屽悓姝?`product_images` 骞惰Е鍙?Meilisearch `syncProduct` 鎴栧湪 Directus webhook 涓閲忔洿鏂般€?
2. **搴楅摵鎼滅储**锛歚/products` 椤甸潰瑙ｆ瀽鏌ヨ鍙傛暟 鈫?璋冪敤 `searchProducts` 鈫?Meilisearch 杩斿洖鎵佸钩瀛楁锛坄attr_*`銆乣image_url`銆乣category_slug` 绛夛級鈫?缁勪欢娓叉煋锛屽苟閫氳繃 `FacetsSidebar` 鏋勯€犺繃婊ゆ潯浠躲€?
3. **璇㈢洏 (RFQ)**锛氫骇鍝侀〉 `RFQForm` 鎻愪氦鍒?`/api/inquiries` 鏃朵細缁忚繃 IP/Email 澶氱骇闄愭祦銆乭oneypot 涓庡瓧娈佃鍓紝鍐嶅啓鍏?Directus `inquiries` + `inquiry_items` 骞惰Е鍙?Nodemailer 閫氱煡锛屽鎴峰彲鍦?`/my/inquiries` 鏌ョ湅鐘舵€併€?
4. **闈欐€佽祫浜?*锛氫骇鍝佸浘鐗囦繚瀛樺湪 Directus files 琛紝缁?`/api/assets/[id]` 浠ｇ悊鍚庨€佸叆 Next Image/`ImageGallery`锛屼篃琚储寮曞啓鍏?`image_url` 渚夸簬搴楅摵鍒楄〃灞曠ず銆?
5. **閭欢閰嶇疆**锛氬悗鍙?`/admin/settings/email` 璋冪敤 Prisma 璇诲啓 email_settings锛岃嫢鏈厤缃垯鍥為€€鍒?`.env`锛屾祴璇曟帴鍙?`/api/admin/email-settings/test` 浣跨敤鐪熷疄 SMTP 楠岃瘉銆?

## 4. 鍩虹璁炬柦涓庣幆澧冨彉閲?

### 4.1 Docker Compose 鏈嶅姟

| 鏈嶅姟 | 闀滃儚涓庣鍙?| 璇存槑 |
| --- | --- | --- |
| `postgres` | `postgres:16` 鏆撮湶 15432鈫?432 | Directus 涓?Prisma 鍏辩敤锛屽悓姝?schema 鍓嶉』淇濊瘉姝ゅ鍣ㄥ仴搴枫€?|
| `redis` | `redis:7` 鏆撮湶 16379鈫?379 | 渚?Directus websocket 涓庡彲閫夌殑 Upstash 鍏煎鏂规锛涙湰鍦伴檺娴侀粯璁や娇鐢ㄥ唴瀛?Map銆?|
| `meilisearch` | `getmeili/meilisearch:v1.6` 鏆撮湶 7700 | `MEILI_MASTER_KEY` 鐢?`.env` 鎻愪緵锛沗scripts/reindex.ts`銆乣/api/reindex` 璋冩暣绱㈠紩銆?|
| `directus` | `directus/directus:10.10` 鏆撮湶 8055 | 渚濊禆 Postgres/Redis锛宍DIRECTUS_ADMIN_TOKEN` 鐢ㄤ簬 Next.js 渚ц鍙栦笌鏂囦欢浠ｇ悊銆?|

### 4.2 鐜鍙橀噺鍒嗙粍锛堣瑙?`.env.example`锛?

- **鏁版嵁搴?/ Directus**锛歚POSTGRES_*`, `DATABASE_URL`, `DIRECTUS_URL`, `DIRECTUS_KEY`, `DIRECTUS_SECRET`, `DIRECTUS_ADMIN_TOKEN`, `DIRECTUS_WEBHOOK_SECRET`銆?
- **鎼滅储**锛歚MEILISEARCH_HOST`, `MEILI_MASTER_KEY`锛堟垨 `MEILISEARCH_MASTER_KEY`锛夈€?
- **Next / 认证**：`APP_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `AUTH_SECRET`, `ADMIN_API_SECRET`, `ADMIN_BOOTSTRAP_EMAIL/PASSWORD`, `COOKIE_SECURE`（可选：在本地 HTTP 或多环境场景下控制是否强制 secure cookies）。
- **SMTP & 閫氱煡**锛歚SMTP_HOST/PORT/USER/PASS`, `SMTP_FROM_NAME/SMTP_FROM_EMAIL`, `NOTIFY_EMAIL_TO`, `SMTP_REPLY_TO`銆?
- **涓婁紶涓庡浘鐗?*锛歚NEXT_PUBLIC_ASSET_BASE_URL`锛堥粯璁や负 `/api/assets`锛屼篃鍙寚鍚?CDN锛夈€?
- **闄愭祦**锛歚UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`锛堟彁渚涘垎甯冨紡閫熺巼闄愬埗锛夈€?
- **鍏朵粬**锛歚NODE_ENV`, `PORT` 绛夈€?

> 鈿狅笍 `.env` 涓哄敮涓€鐪熷疄鏉ユ簮锛宍.env.local` 浠呬綔鍘嗗彶澶囦唤锛屽悗缁瀛樺湪璇锋墜鍔ㄥ垹闄ゆ垨蹇界暐锛岄槻姝㈠啿绐併€?

## 5. 鍛戒护銆佽剼鏈笌鑷姩鍖?

### 5.1 NPM Scripts

| 鍛戒护 | 璇存槑 |
| --- | --- |
| `npm run dev` | 鍚姩 Next.js 寮€鍙戞湇鍔″櫒锛堥粯璁?`localhost:3000`锛夛紝瀹炴椂璇诲彇 Directus銆?|
| `npm run build` / `npm run start` | 浜у嚭鐢熶骇鍖呭苟浠?Node 杩愯銆?|
| `npm run lint` / `npm run typecheck` | ESLint + TypeScript 闈欐€佹鏌ャ€?|
| `npm run db:apply` | 鎵ц `scripts/apply-schema.ts`锛屾妸 `schema/` 蹇収鍐欏叆 Directus銆?|
| `npm run db:seed` | `scripts/seed-directus.ts`锛屾壒閲忓鍏ュ垎绫汇€佷骇鍝併€佸睘鎬х瓑鍒濆鏁版嵁銆?|
| `npm run db:export` | 瀵煎嚭 Directus schema 鏂逛究鐗堟湰绠＄悊銆?|
| `npm run search:reindex` | 閲嶆柊浠?Directus 鎷夊彇浜у搧骞堕噸寤?Meilisearch 绱㈠紩銆?|
| `npm run auth:admin` | `scripts/create-admin.ts` 鍒涘缓榛樿鍚庡彴璐﹀彿銆?|

### 5.2 `scripts/` 鐩綍

| 鏂囦欢 | 浣滅敤 |
| --- | --- |
| `apply-schema.ts` | 璇诲彇 `schema/snapshot.*` 骞惰皟鐢?Directus 绠＄悊 API 鍚屾闆嗗悎/瀛楁銆?|
| `backfill-product-gallery.ts` | 灏?Directus `products.image_id` 鍘嗗彶瀛楁杩佺Щ鍒?Prisma `product_images` 琛紝淇濇寔澶氬浘涓€鑷淬€?|
| `check-admin-role.ts` | 妫€鏌?Directus / Prisma 涓鐞嗗憳瑙掕壊閰嶇疆鏄惁姝ｇ‘銆?|
| `create-admin.ts` | 鍩轰簬 `ADMIN_BOOTSTRAP_*` 鍒涘缓鎴栭噸缃?Prisma `app_users` 涓殑绠＄悊鍛樸€?|
| `export-directus-schema.ts` | 鍖呭惈瀛楁銆侀泦鍚堛€佸叧绯荤殑瀵煎嚭宸ュ叿锛岀粨鏋滃啓鍏?`schema/export/`銆?|
| `get-token.ts` | 杈呭姪鑴氭湰锛屼粠 Directus 浠ヨ处鍙峰瘑鐮佷氦鎹?Access Token銆?|
| `reindex.ts` | 璋冪敤 `rebuildIndex` 閲嶅缓 Meilisearch銆?|
| `reset-auth-schema.ts` | 閽堝 Directus 鐨?auth 鐩稿叧闆嗗悎鍋氱壒瀹氫慨澶嶃€?|
| `sanitize-snapshot.ts` | 娓呯悊 Directus snapshot 涓殑鍔ㄦ€佸瓧娈?ID锛岄槻姝㈡彁浜ゆ晱鎰熶俊鎭€?|
| `seed-directus.ts` | 鍒涘缓鍩虹鍒嗙被銆佸睘鎬с€佷骇鍝佸苟闄勫甫绀轰緥灞炴€у€笺€?|
| `sync-meilisearch.ts` | 鎵归噺鍚屾鍗曚釜浜у搧鍒?Meilisearch锛岀敤浜?webhook/璋冭瘯銆?|
| `test-admin-flow.ts` | 妯℃嫙绠＄悊鍛樼櫥闄嗐€佽幏鍙栨潈闄愪笌鍏抽敭璋冪敤锛堝仴搴锋鏌ワ級銆?|
| `update-schema-v2.ts` | 鐗堟湰鍖?schema 鏇存柊鑴氭湰锛堝鐞?Directus 鍙樻洿锛夈€?|

> 鎵€鏈夎剼鏈€氳繃 `npx tsx` 鎵ц锛屼緷璧?`.env` 涓殑 Directus/鏁版嵁搴撳弬鏁般€?

## 6. 浠ｇ爜缁撴瀯涓庢枃浠惰鏄?

### 6.1 鏍圭洰褰曚笌閰嶇疆

| 璺緞 | 璇存槑 |
| --- | --- |
| `.env` | 鍞竴閰嶇疆鍏ュ彛锛孨ext.js/Docker/鑴氭湰鍧囪鍙栨鏂囦欢銆?|
| `.env.example` | 鐜鍙橀噺妯℃澘锛屾寜鍒嗙粍鍒楀嚭闇€瑕佸～鍏呯殑 key銆?|
| `.env.local` | 鍘嗗彶閬楃暀鐨勬湰鍦板壇鏈紝榛樿涓嶄娇鐢ㄣ€?|
| `.eslintrc.json` | ESLint 閰嶇疆锛堜娇鐢?`next` preset锛夈€?|
| `.gitignore` | 蹇界暐 `node_modules`銆乣.next` 绛夈€?|
| `DEPLOYMENT_MINIMAL.md` | 鏋佺畝閮ㄧ讲姝ラ澶囧繕銆?|
| `docker-compose.yml` | 瀹氫箟 Postgres/Redis/Meilisearch/Directus 鏈嶅姟銆?|
| `next-env.d.ts` | Next.js 鑷姩鐢熸垚鐨?TypeScript 澹版槑銆?|
| `next.config.js` | 閰嶇疆 remotePatterns锛堟敮鎸?Directus 璧勪骇锛夛紝浜﹀彲鎵╁睍 `/api/assets`銆?|
| `package.json` / `package-lock.json` | NPM 渚濊禆銆佽剼鏈€?|
| `postcss.config.js` / `tailwind.config.js` | Tailwind + PostCSS 閰嶇疆銆?|
| `README.md` | 蹇€熷紑濮嬨€佸崌绾ц褰曚笌閮ㄧ讲鍛戒护銆?|
| `STARTUP.md` | 鍚姩娴佺▼琛ュ厖璇存槑銆?|
| `tsconfig.json` / `tsconfig.tsbuildinfo` | TypeScript 缂栬瘧閰嶇疆涓庣紦瀛樸€?|
| `tmp_products.html`, `test-image.jpg` 绛?| 璋冭瘯鏂囦欢锛屽彲蹇界暐銆?|

### 6.2 `src/` 鏍瑰眰

| 璺緞 | 璇存槑 |
| --- | --- |
| `src/globals.css` | Tailwind `@layer` 鍙婂叏灞€鏍峰紡銆?|
| `src/app/layout.tsx` | 鏍瑰竷灞€銆丼EO Metadata銆佺粍缁?JSON-LD銆?|
| `src/app/robots.ts` / `sitemap.ts` | SEO robots 鍙?sitemap 鐢熸垚銆?|
| `src/app/components/header.tsx` | 鏃х増 header锛堜繚鐣欎互鍏煎鍐呴儴缁勪欢锛夈€?|
| `src/app/api-docs/page.tsx` | 鑷缓 API 鏂囨。椤甸潰锛岄泦涓鏄?`/api/*` 浣跨敤鏂瑰紡銆?|
| `src/app/components/` | 鍏变韩 header锛堟棫鐗堬級绛夊疄鐢ㄧ粍浠躲€?|
| `src/middleware.ts` | NextAuth 淇濇姢 `/admin/*` 璺敱銆?|
| `src/types/next-auth.d.ts` | 鎵╁睍 session token锛堟坊鍔?`id`銆乣role`锛夈€?|

### 6.3 `src/lib/`

| 鏂囦欢 | 璇存槑 |
| --- | --- |
| `auth.ts` | 瀹氫箟 NextAuth options銆丆redentials Provider銆乻ession/jwt callbacks銆?|
| `directus.ts` | Directus SDK 瀹㈡埛绔€佸闆嗗悎绫诲瀷澹版槑銆?|
| `email-settings.ts` | Prisma 璁块棶 `email_settings`锛屽惈 env fallback銆佷繚瀛?瑙ｆ瀽閫昏緫涓庢祴璇曡緟鍔┿€?|
| `inquiries.ts` | Directus 璇㈢洏璇诲啓宸ュ叿锛坄getInquiries`銆乣getInquiry`銆乣updateInquiryStatus`锛夈€?|
| `meilisearch.ts` | 鍏ㄩ噺鎼滅储閫昏緫锛氱储寮曞畾涔夈€佹墎骞冲寲銆佷换鍔＄洃鎺с€乣searchProducts`銆乣syncProduct`銆乣rebuildIndex`銆?|
| `prisma.ts` | PrismaClient 鍗曚緥锛屽鍑烘ā鍨嬬被鍨嬨€?|
| `product-gallery.ts` | Prisma 鎿嶄綔 `product_images`锛堣鍙栥€佹浛鎹€佸垹闄ゃ€丮ap 鎵归噺锛夈€?|
| `rate-limit.ts` | 鑷畾涔夐檺娴佸櫒锛屾敮鎸?Upstash Redis / 鏈湴 Map銆?|

### 6.4 `src/components/`

| 鏂囦欢 | 璇存槑 |
| --- | --- |
| `footer.tsx` | 鍓嶅彴椤佃剼銆?|
| `image-gallery.tsx` | 鑷姩杞挱鐨勪骇鍝佸浘缁勪欢锛屾敮鎸佺缉鐣ュ浘涓庣┖鎬併€?|
| `InquiryForm.tsx` | 鏃х増 RFQ 寮圭獥锛屼粛鍙鐢ㄣ€?|
| `json-ld.tsx` | 杈撳嚭缁撴瀯鍖栨暟鎹殑 helper銆?|
| `rfq-form.tsx` | 鏂扮増 Request Quote 琛ㄥ崟锛堥槻 spam銆佹垚鍔熸€併€丅ack to Home锛夈€?|
| `search-input.tsx` | Header 鎼滅储妗嗭紙Suspense + URL 鍚屾锛夈€?|
| `admin/product-form.tsx` | 鍚庡彴鍒涘缓/缂栬緫浜у搧琛ㄥ崟锛堝睘鎬у～鍐欍€丏irectus 涓婁紶銆佸鍥俱€丼et Cover锛夈€?|
| `layout/admin-header.tsx` | 鍚庡彴瀵艰埅 + 蹇嵎閾炬帴 + 鐧诲嚭銆?|
| `layout/admin-logout-btn.tsx` | 璋冪敤 `signOut`銆?|
| `layout/marketing-header.tsx` | 鍓嶅彴瀵艰埅 + 鐧诲綍鎬?+ 鎼滅储銆?|
| `layout/user-nav.tsx` | 鐧诲綍/娉ㄥ唽/鎴戠殑璇㈢洏/鍚庡彴鍏ュ彛 + 鐧诲嚭鎸夐挳銆?|

### 6.5 `src/app/(marketing)`

| 鏂囦欢 | 璇存槑 |
| --- | --- |
| `layout.tsx` | 濂楃敤 `MarketingHeader` + `Footer`銆?|
| `page.tsx` | 钀ラ攢钀藉湴椤碉紙Hero銆丆TA锛夈€?|
| `login/page.tsx` | 鐧诲綍琛ㄥ崟锛岃皟鐢?NextAuth `signIn`銆?|
| `register/page.tsx` | 娉ㄥ唽琛ㄥ崟锛岃姹?`/api/auth/register`銆?|

### 6.6 `src/app/(shop)`

#### 鐩綍椤典笌璇︽儏

| 璺緞 | 璇存槑 |
| --- | --- |
| `products/page.tsx` | 鏍稿績浜у搧鍒楄〃椤碉紝璋冪敤 `searchProducts` 骞舵覆鏌?`SearchBar`銆乣FacetsSidebar`銆乣ProductCard`銆?|
| `products/[slug]/page.tsx` | 浜у搧璇︽儏锛欴irectus 鎷夊彇灞炴€с€佽鏍笺€乣getProductGallery` 鍥剧墖 + `ImageGallery` + `RFQForm`銆?|
| `products/components/facets-sidebar.tsx` | 瀹㈡埛绔繃婊ゅ櫒锛屾敮鎸?Suspense銆乣useTransition`銆?|
| `products/components/product-card.tsx` | 鎼滅储缁撴灉鍗＄墖锛屽睍绀哄皝闈㈠浘銆佸垎绫诲窘鏍囥€佽鏍?Chips銆?|
| `products/components/search-bar.tsx` | 鍒楄〃椤甸《閮ㄦ悳绱€?|
| `categories/[slug]/page.tsx` | 鍒嗙被璇︽儏椤碉紝璇诲彇 Directus 鍒嗙被骞惰皟鐢?`searchProducts`銆?|

#### 鐢ㄦ埛璇㈢洏

| 璺緞 | 璇存槑 |
| --- | --- |
| `my/inquiries/page.tsx` | 鐧诲綍鐢ㄦ埛鏌ョ湅鑷繁鐨?RFQ 鍒楄〃銆?|
| `my/inquiries/[id]/page.tsx` | 璇㈢洏璇︽儏椤碉紝楠屾潈鍚庡睍绀?items銆?|

### 6.7 `src/app/(admin)`

| 璺緞 | 璇存槑 |
| --- | --- |
| `layout.tsx` | 鍚庡彴閫氱敤甯冨眬銆?|
| `admin/dashboard/page.tsx` | 鎬昏闈㈡澘锛氫骇鍝佹€绘暟銆?4h 璇㈢洏銆佸仴搴峰崱鐗囥€侀噸寤虹储寮曟寜閽€?|
| `admin/dashboard/components/dashboard-reindex.tsx` | 杈撳叆 `ADMIN_API_SECRET` 瑙﹀彂 `/api/reindex`銆?|
| `admin/dashboard/components/health-card.tsx` | 瀹㈡埛绔疆璇?`/api/health` 灞曠ず Directus/Meili 鐘舵€併€?|
| `admin/inquiries/page.tsx` | RFQ 鍒楄〃锛堟寜鐘舵€佽繃婊わ級銆?|
| `admin/inquiries/[id]/page.tsx` | RFQ 璇︽儏 + `status-buttons.tsx` 鏇存敼鐘舵€併€?|
| `admin/inquiries/actions.ts` | 鏈嶅姟鍣ㄥ姩浣滈泦鍚堬紙濡傜姸鎬佹洿鏂帮級銆?|
| `admin/products/page.tsx` | 浜у搧鍒楄〃 + 缂╃暐鍥撅紙鍙?gallery 绗竴寮狅級銆?|
| `admin/products/new/page.tsx` | 鏂板缓琛ㄥ崟銆?|
| `admin/products/[id]/edit/page.tsx` | 缂栬緫椤碉紙鍚垹闄ゆ寜閽級銆?|
| `admin/products/[id]/edit/delete-button.tsx` | 鍒犻櫎浜у搧骞跺埛鏂般€?|
| `admin/users/page.tsx` | 鐢ㄦ埛绠＄悊椤靛叆鍙ｏ紝鏈嶅姟绔鍙栭粯璁ゅ垪琛ㄥ苟鎸傝浇浜や簰瀹瑰櫒銆?|
| `admin/users/user-management-shell.tsx` | 瀹㈡埛绔氦浜掑眰锛氭敮鎸侀偖绠?瑙掕壊/娉ㄥ唽鏃ユ湡绛涢€夈€佹壒閲忓垹闄ゆ櫘閫氱敤鎴枫€佹煡鐪嬭鐩樺巻鍙诧紝骞跺彲璁剧疆/娓呴櫎 VIP 澶磋銆?|
| `admin/settings/email/page.tsx` | 閭欢閰嶇疆鐣岄潰銆?|
| `admin/settings/email/email-settings-form.tsx` | 瀹㈡埛绔〃鍗曪紙鍚?env 鎻愮ず銆佹祴璇曞彂閫侊級銆?|

### 6.8 API Routes `src/app/api`

| 璺緞 | 璇存槑 |
| --- | --- |
| `admin/email-settings/route.ts` | GET/PUT 閭欢閰嶇疆锛圥risma锛夈€?|
| `admin/email-settings/test/route.ts` | 鍙戦€佹祴璇曢偖浠躲€?|
| `admin/products/route.ts` | GET 浜у搧鍒楄〃銆丳OST 鏂板缓浜у搧锛堝惈 gallery锛夈€?|
| `admin/products/[id]/route.ts` | GET/PUT/DELETE 鍗曚釜浜у搧锛屼繚鎸?Meilisearch 涓?gallery 鍚屾銆?|
| `admin/users/route.ts` | 绠＄悊鍛樺垎椤垫煡璇?Prisma 涓殑娉ㄥ唽鐢ㄦ埛锛屾敮鎸侀偖绠?瑙掕壊/娉ㄥ唽鏃ユ湡绛涢€夊苟杩斿洖鍏冩暟鎹€?|
| `admin/users/[id]/route.ts` | 鎷夊彇鎸囧畾璐﹀彿鍙?Directus 璇㈢洏璁板綍锛屾敮鎸佸垹闄ゆ櫘閫氱敤鎴锋垨鏇存柊 VIP 澶磋銆?|
| `admin/users/bulk-delete/route.ts` | 鎸夊綋鍓嶇瓫閫夋潯浠舵壒閲忓垹闄ゆ櫘閫氱敤鎴凤紝甯﹀崟娆?500 鏉＄殑瀹夊叏闃堝€笺€?|
| `admin/upload/route.ts` | 閫氳繃 Directus files API 涓婁紶鍥剧墖銆?|
| `assets/[id]/route.ts` | 璧勪骇浠ｇ悊锛岄檮甯︾紦瀛樺ご銆?|
| `auth/register/route.ts` | 鍒涘缓 `app_users`锛堥粯璁ゆ櫘閫氱敤鎴凤級锛屽唴缃?honeypot + 鏈€灏忓仠鐣欐椂闀?+ IP 闄愭祦銆?|
| `auth/[...nextauth]/route.ts` | NextAuth handler銆?|
| `health/route.ts` | 鑷 Directus & Meilisearch锛堣繑鍥炲欢杩燂級銆?|
| `inquiries/route.ts` | RFQ 鎻愪氦鍏ュ彛锛圛P/Email 澶氱骇闄愭祦銆佸瓧娈佃鍓€丏irectus 鍐欏叆涓庡畨鍏ㄩ偖浠堕€氱煡锛夈€?|
| `inquiries/[id]/route.ts` | 鑾峰彇鎸囧畾璇㈢洏锛堝惈 items锛夈€?|
| `inquiries/[id]/status/route.ts` | 绠＄悊鍛樻洿鏂拌鐩樼姸鎬併€?|
| `reindex/route.ts` | 瑙﹀彂閲嶅缓 Meilisearch 绱㈠紩锛堥渶绠＄悊鍛樹細璇濇垨 `ADMIN_API_SECRET`锛夈€?|
| `search/products/route.ts` | 瀵瑰鎼滅储 API锛屽皝瑁?`searchProducts`銆?|
| `webhook/directus/route.ts` | Directus Webhook 鍏ュ彛锛屽熀浜?`DIRECTUS_WEBHOOK_SECRET` 鍚屾/鍒犻櫎浜у搧绱㈠紩銆?|

> `api/sync-product` 鐩綍鐩墠涓虹┖锛屽悗缁彲绉婚櫎鎴栧鐢ㄤ互鍏煎鏃х殑 webhook URL銆?

### 6.9 鍏朵粬婧愮爜

| 璺緞 | 璇存槑 |
| --- | --- |
| `prisma/schema.prisma` | Prisma 妯″瀷锛圓ppUser銆丒mailSettings銆丳roductImage锛夈€?|
| `prisma/migrations/*` | Prisma 杩佺Щ鍘嗗彶銆?|
| `schema/snapshot.*` | Directus schema 蹇収锛圝SON/YAML/鑴辨晱鐗堟湰锛夈€?|
| `schema/export/*` | `collections.json`銆乣fields.*.json`銆乣relations.json` 绛?Directus 璇︾粏缁撴瀯銆?|
| `src/lib/admin-users.ts` | 澶嶇敤鐨勭敤鎴峰垪琛?璇︽儏鏈嶅姟锛屽皝瑁?Prisma + Directus 璁块棶閫昏緫锛屽苟瀵煎嚭 `buildUserFilters`/`toAdminUserSummary` 绛夊伐鍏枫€?|
| `src/lib/vip-column.ts` | 杩愯鏃舵娴?`vipTitle` 瀛楁鏄惁瀛樺湪锛岃嫢鏁版嵁搴撴湭杩佺Щ浼氫紭闆呴檷绾у苟鎻愮ず绠＄悊鍛樻墽琛?`npx prisma migrate deploy`銆?|
| `src/types/admin-users.ts` | 鐢ㄦ埛绠＄悊妯″潡鐨勫墠鍚庣鍏变韩绫诲瀷瀹氫箟銆?|

| `tests/` | 棰勭暀娴嬭瘯鐩綍锛岀洰鍓嶄负绌恒€?|

## 7. 鏁版嵁妯″瀷涓庣储寮?

- **Directus**锛氭牳蹇冮泦鍚堟湁 `products`锛堝惈 `category_id`, `attribute_values`, `image_id`锛夈€乣categories`銆乣attributes`锛坄is_facet` 鍐冲畾鏄惁鍏?Meili锛夈€乣product_attribute_values`銆乣inquiries`銆乣inquiry_items`銆乣files`銆侱irectus 閫氳繃 snapshot 绠＄悊 schema 骞剁敱 `scripts/apply-schema.ts` 鍚屾銆?
- **Prisma锛圥ostgres锛?*锛?
  - `AppUser`锛歂extAuth 鐧诲綍璐﹀彿锛屽寘鍚?email銆乸asswordHash銆乺ole銆佹渶鍚庣櫥褰曟椂闂村強鍙€?`vipTitle`銆?  - `EmailSettings`锛氬悗鍙伴厤缃?SMTP/閫氱煡銆乺eply-to锛岃嫢瀛楁涓虹┖鍒欏洖閫€ `.env`銆?
  - `ProductImage`锛氬鍥句俊鎭紝`sortOrder` 鍐冲畾灏侀潰锛屽悗鍙扮紪杈戞椂鍐欏叆銆?
- **Meilisearch**锛歚products` 绱㈠紩瀛楁鍖呮嫭 `id/sku/name/slug/category_slug/category_name/image_url` 浠ュ強鍔ㄦ€?`attr_<key>`銆俙formatFilterValue` 璐熻矗瀵瑰瓧绗︿覆鍔犲紩鍙凤紝瀵规暟鍊肩洿鎺ュ瓨鍌紝浠ヤ繚璇?faceted search 绮剧‘鏃犺銆?

## 8. 鍔熻兘妯″潡璇﹁В

1. **浜у搧鐩綍涓庢悳绱?*锛歚/products` 瑙ｆ瀽 URL 鍙傛暟 鈫?`searchProducts` 鐢熸垚 filter string锛堝垎绫?+ JSON filters锛夆啋 Meilisearch 杩斿洖 facetDistribution 鈫?`FacetsSidebar` 瀹㈡埛绔覆鏌撳苟閫氳繃 `useTransition` 鎻愬崌浜や簰銆俙ProductCard` 鏄剧ず attr chips銆丼KU銆佸皝闈㈠浘锛坄image_url` 鏉ヨ嚜 gallery 绗竴寮狅級銆?
2. **浜у搧璇︽儏涓庡浘搴?*锛歚/[slug]` 椤甸潰鍏堜粠 Directus 鑾峰彇浜у搧涓庡睘鎬э紝鍐嶈 Prisma `product_images` 鐢熸垚 URL锛坄NEXT_PUBLIC_ASSET_BASE_URL` + fileId锛夛紝浼犻€掑埌 `ImageGallery` 鑷姩杞挱 + 缂╃暐鍥撅紱鑻ユ棤澶氬浘锛屽洖閫€ `image_id`銆俙RFQForm` 涓?`jsonLd` 缁撳悎鎻愬崌 SEO銆?
3. **鍚庡彴浜у搧绠＄悊**锛歚ProductForm` 鍏佽澶氭枃浠朵笂浼狅紙璧?`/api/admin/upload`锛夛紝淇濆瓨鏃舵妸 `gallery` 鍐欏叆 Prisma锛屽苟鎶婄涓€寮犺鐩?Directus `image_id` 浠ュ吋瀹规棫娴佺▼锛沗syncProduct` 浼氶噸鏂版煡璇?Directus + gallery 骞舵洿鏂?Meilisearch銆?
4. **Directus 鈫?Meilisearch 鍚屾**锛歚scripts/reindex.ts`/`/api/reindex` 鎵归噺閲嶅缓绱㈠紩锛汥irectus webhook 鍦?`items.create/update/delete` 鏃惰Е鍙?`syncProduct` 鎴?`deleteProductIndex`锛屼繚闅滃疄鏃朵竴鑷淬€傝嫢閲嶆瀯灞炴€э紝闇€瑕侀噸璺?`npm run search:reindex`銆?
5. **璇㈢洏涓庨偖浠堕€氱煡**锛歚/api/inquiries` 鍏堝 IP 鐖嗗彂/24 灏忔椂閰嶉銆丒mail 閰嶉鍙?honeypot `website` 瀛楁鍋氶檺娴佷笌瑁佸壀锛屽啀鍐欏叆 Directus `inquiries`/`inquiry_items`锛屽悗鍙?`sendNotification` 渚濇嵁 Prisma mail config/Nodemailer 鍙戦€?HTML 閭欢銆傛垚鍔熷悗 `RFQForm` 鎻愮ず `Back to Home` 骞惰繑鍥?`inquiry_id`锛屽鎴峰彲鍦?`/my/inquiries` 鏌ヨ銆?
6. **鍚庡彴閭欢璁剧疆**锛歚/admin/settings/email` 琛ㄥ崟瀹炴椂淇濆瓨鍒?Prisma锛屽苟鏀寔娓呯┖瀵嗙爜銆佹煡鐪?env 鍥為€€椤广€佸彂閫佹祴璇曢偖浠?`/api/admin/email-settings/test`锛堝彲鎸囧畾鏀朵欢浜猴級銆?
7. **璁よ瘉涓庤闂帶鍒?*锛歂extAuth Credentials Provider 楠岃瘉 Prisma `app_users`锛宻ession token 鍖呭惈 `role` 涓?`vipTitle`锛沗src/middleware.ts` 鎷︽埅 `/admin` 璇锋眰锛屼笉鏄鐞嗗憳鍒欓噸瀹氬悜棣栭〉锛沗UserNav` 鏍规嵁瑙掕壊鏄剧ず 鈥淎dmin鈥?鈥淢y Inquiries鈥濓紝骞跺湪鏅€氱敤鎴风櫥褰曟椂灞曠ず VIP 澶磋銆?8. **璧勪骇浠ｇ悊涓庡浘鐗囩瓑姣?*锛歚/api/assets/[id]` 浣跨敤 `DIRECTUS_ADMIN_TOKEN` 浠ｇ悊鏂囦欢锛屽苟璁剧疆 `Cache-Control`銆傛墍鏈夊浘鐗囩粍浠舵敼鐢ㄨ璺緞锛屾敮鎸佷换鎰忔牸寮忥紙JPG/PNG/WebP锛夛紝鍦ㄥ墠绔粺涓€ `object-cover` 灏哄銆?
9. **閫熺巼闄愬埗涓庡畨鍏?*锛歚createRateLimiter` 榛樿浣跨敤鍏ㄥ眬 Map锛屽彲閫?Upstash Redis锛沗/api/inquiries`銆乣/api/auth/register` 浠ュ強 NextAuth 鐧诲綍閮借褰?requestId/IP 骞跺簲鐢ㄥ绾ч檺娴侊紝寮傚父鏃朵粎杩斿洖閫氱敤閿欒銆?
10. **鍋ュ悍鐩戞祴**锛歚/api/health` 骞跺彂妫€娴?Directus锛堣 `inquiries`锛変笌 Meilisearch锛坄health()`锛夛紝鍚庡彴 Dashboard 鐢?`HealthCard` 灞曠ず寤惰繜涓庣姸鎬併€?

## 9. 閮ㄧ讲 / 鏂版満鍒濆鍖栨祦绋?

1. **鍏嬮殕涓庡畨瑁?*锛歚git clone ... && cd waimao && npm install`銆?
2. **鐜鍙橀噺**锛氬鍒?`.env.example` 鈫?`.env` 骞跺～鍐?Directus/Postgres/Meili/SMTP/NextAuth/璧勪骇/閭绛夊繀濉」銆傜‘淇?`.env` 鍞竴銆?
3. **鍚姩鍩虹璁炬柦**锛歚docker compose up -d`锛岀瓑寰?Postgres銆丷edis銆丮eilisearch銆丏irectus Healthy锛堝彲鐢?`docker ps` / `docker logs` 鏌ョ湅锛夈€?
4. **Prisma 鍚屾**锛歚npx prisma db push && npx prisma generate`锛堟垨鍦ㄧ敓浜ф墽琛?`npx prisma migrate deploy` 浠ュ簲鐢?`20260202_add_vip_title` 绛夋渶鏂?migration锛夛紝蹇呰鏃?`npm run auth:admin` 鍒涘缓绠＄悊鍛樸€?5. **瀵煎叆 Directus Schema**锛歚npm run db:apply`锛岃嫢棣栨杩愯鍙户缁墽琛?`npm run db:seed`銆乣npm run search:reindex`銆?
6. **杩愯 Next.js**锛歚npm run dev`锛堟垨 `npm run build && npm run start`锛夛紝璁块棶 `http://localhost:3000` 妫€鏌ュ墠鍚庡彴鏄惁姝ｅ父銆?
7. **閭欢閰嶇疆**锛氱櫥褰?`/admin/settings/email`锛岃ˉ鍏?SMTP 淇℃伅骞跺彂閫佹祴璇曢偖浠讹紝鎴栧湪 `.env` 鐩存帴鎻愪緵銆?
8. **鏍￠獙**锛氬墠鍙?`/products` 婊氬姩銆佺瓫閫夈€丷FQ锛涘悗鍙?`/admin/products` 缂╃暐鍥俱€佺紪杈戝鍥撅紱`/api/health` 杩斿洖 `ok`锛涘鏈?Directus 鏁版嵁鏇存柊璁板緱鎵ц `npm run search:reindex`銆傝嫢閮ㄧ讲澶氭満骞跺紑鍚?Upstash锛岃ˉ鍏?`UPSTASH_REDIS_*`銆?

## 10. 璋冭瘯銆佹祴璇曚笌鍚庣画寤鸿

- **鐜版湁妫€娴?*锛歚npm run lint`銆乣npm run typecheck`锛屽悗鍙?Dashboard 鑳藉鎰熺煡 Directus/Meilisearch 鍋ュ悍锛汻FQ 鎴愬姛鎬佹彁绀鸿繑鍥為椤碉紝閬垮厤娉勯湶鍚庡彴鍏ュ彛銆?
- **鎵嬪姩娴嬭瘯寤鸿**锛?
  1. 鍚?`/api/inquiries` 鎻愪氦琛ㄥ崟骞剁‘璁?Directus + 閭欢閫氱煡鏀跺埌銆?
  2. 鏂板/缂栬緫浜у搧 鈫?妫€鏌?`/admin/products` 缂╃暐鍥俱€佸墠鍙?`/products` / 璇︽儏椤?image gallery銆?
  3. 璋冩暣灞炴€?鍒嗙被 鈫?杩愯 `npm run search:reindex` 鈫?楠岃瘉绛涢€夛紙濡?diameter=M10 涓嶅啀杩斿洖 M12锛夈€?
  4. 娴嬭瘯 `/api/assets/<fileId>` 鍦ㄥ鏍煎紡锛圝PG/PNG/WebP锛変笅鍧囧彲鍔犺浇銆?
  5. 浣跨敤 `Reindex` Quick Action 楠岃瘉 `ADMIN_API_SECRET` 鏄惁姝ｇ‘銆?
- **缂哄け鐨勮嚜鍔ㄥ寲**锛氭殏鏃犲崟鍏?闆嗘垚娴嬭瘯锛屽彲浼樺厛涓?`src/lib/meilisearch.ts` 鐨?`formatFilterValue`銆乣searchProducts` 浠ュ強 `/api/inquiries` 娴佺▼缂栧啓娴嬭瘯锛屾垨閫氳繃 Playwright 楠岃瘉鍥剧墖杞挱/filters/RFQ銆?
- **宸茬煡娉ㄦ剰鐐?*锛?
  - README 涓枃鏍囬瀛樺湪缂栫爜寮傚父锛屽彲鍦ㄥ悗缁粺涓€鏀逛负 UTF-8銆?
  - 鑻?Directus 灞炴€у瓧娈靛彉鏇达紝鍔″繀鍚屾鏇存柊 `schema/snapshot.*` 骞堕噸鏂拌繍琛?`npm run db:apply` 涓?`npm run search:reindex`銆?
  - `product_images` 渚濊禆 Prisma 鏈湴搴擄紝鑻ユ崲搴撻渶鎵ц `npx prisma migrate deploy`銆?
  - `api/sync-product` 鐩綍鏆傜┖锛屽垹闄ゅ墠璇风‘璁や笉浼氬奖鍝嶆棫鐨?webhook URL銆?|

---

璇ユ枃妗ｄ細闅忛渶姹傛洿鏂帮紝濡傛柊澧炴ā鍧?鑴氭湰/閮ㄧ讲姝ラ锛岃鍦?`README.md` 涓庢 `project.md` 鍚屾璁板綍锛岀‘淇濆悗缁垚鍛樺彲鏃犵紳鎺ユ墜銆傜寮€鍙戦『鍒╋紒
