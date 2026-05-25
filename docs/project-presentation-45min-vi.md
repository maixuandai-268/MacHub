# CyberShop: Tài Liệu Thuyết Trình Dự Án 45 Phút

## Mục tiêu của buổi thuyết trình

- Giới thiệu kiến trúc tổng thể của dự án theo hướng 3-apps.
- Giải thích tư duy thiết kế API-centric và module-based.
- Đi sâu vào các nghiệp vụ xương sống: Auth, Order, Inventory, Media upload.
- Chuẩn bị trước các câu hỏi phản biện khó nhất về API, dữ liệu và edge cases.

## Cách chia thời gian 45 phút

### Phần 1. Trình bày chính: 25 phút

1. Kiến trúc tổng thể và tư duy thiết kế: 5 phút
2. Cấu trúc module backend: 5 phút
3. Luồng nghiệp vụ xương sống: 10 phút
4. Tối ưu hóa và hiệu năng: 5 phút

### Phần 2. Phản biện API chuyên sâu: 20 phút

1. Tính toàn vẹn dữ liệu: 7 phút
2. Bảo mật và xác thực: 6 phút
3. Xử lý lỗi và edge cases: 5 phút
4. Mẹo chốt điểm khi phản biện: 2 phút

---

# PHẦN 1: TRÌNH BÀY CHÍNH 25 PHÚT

## 1. Kiến trúc Tổng thể và Tư duy thiết kế (5 phút)

### 1.1. Mô hình 3-Apps

Dự án được tách thành 3 ứng dụng độc lập:

- `apps/user`: storefront cho khách hàng.
- `apps/admin`: backoffice cho quản trị viên.
- `apps/api`: backend trung tâm xử lý dữ liệu và nghiệp vụ.

### Cách nói khi thuyết trình

> Em chọn mô hình 3-apps thay vì dồn tất cả vào một codebase frontend-backend hỗn hợp vì em muốn tách rõ trách nhiệm. Storefront phục vụ khách hàng cuối, admin phục vụ vận hành nội bộ, còn API là lõi nghiệp vụ. Cách tách này giúp code dễ bảo trì hơn, giảm coupling, và sau này có thể scale hoặc deploy riêng từng app.

### Ý nghĩa kiến trúc

- `apps/user` chỉ tập trung vào trải nghiệm mua sắm.
- `apps/admin` chỉ tập trung vào vận hành: quản lý sản phẩm, đơn hàng, inventory, blog, khách hàng.
- `apps/api` là nơi giữ business logic thật, nên dù client là user hay admin thì vẫn phải đi qua cùng một lõi kiểm soát dữ liệu.

### Điểm ghi nhớ

- Đây là kiến trúc module hóa theo vai trò người dùng.
- Frontend không giữ logic nghiệp vụ lõi.
- Backend là nguồn sự thật của hệ thống.

---

### 1.2. API-Centric

Trong dự án này, `apps/api` là trung tâm.

- Mọi nghiệp vụ quan trọng đều nằm ở backend:
  - đăng nhập/refresh token
  - tạo đơn COD
  - tạo payment VNPay
  - reserve/release inventory
  - thống kê dashboard
  - upload ảnh

- `apps/user` và `apps/admin` chỉ là client tiêu thụ dữ liệu qua HTTP API.

### Cách nói khi thuyết trình

> Em đi theo hướng API-centric, nghĩa là frontend không tự quyết định nghiệp vụ. Frontend chỉ gửi intent của người dùng, còn backend mới là nơi kiểm tra tính hợp lệ, tính toán tổng tiền, giữ kho, đổi trạng thái đơn hàng và ghi log inventory. Nhờ đó hai frontend khác nhau vẫn dùng chung một nguồn logic duy nhất.

### Ví dụ

- Khách bấm `Place COD order` ở user app.
- Frontend không tự trừ stock.
- Backend trong `order.service.js` kiểm tra stock, tạo order, reserve inventory và trả về kết quả.

---

### 1.3. Middleware Pipeline

Luồng một request đi qua backend hiện tại:

1. `CORS`
2. `Helmet`
3. `Morgan`
4. `cookieParser`
5. `express.json` và `express.urlencoded`
6. `Auth middleware` nếu route cần bảo vệ
7. `Controller`
8. `notFoundHandler`
9. `errorHandler`

Điểm này thể hiện rất rõ ở:

- `apps/api/src/app.js`

### Cách nói khi thuyết trình

> Khi một request đi vào hệ thống, em không đưa thẳng vào business logic ngay. Nó phải đi qua một pipeline chuẩn: đầu tiên là CORS để kiểm soát origin, sau đó là Helmet để tăng cường security headers, rồi parser để đọc body và cookie. Nếu route cần bảo vệ thì middleware auth sẽ xác thực token, và chỉ sau đó controller mới xử lý nghiệp vụ. Nếu có lỗi thì toàn bộ được dồn về error handler tập trung.

### Ý nghĩa

- bảo mật tốt hơn
- controller gọn hơn
- lỗi được xử lý tập trung
- dễ quan sát và debug

---

## 2. Cấu trúc Module Backend (5 phút)

### 2.1. Module-based Architecture

Backend được chia theo domain:

- `auth`
- `customers`
- `products`
- `categories`
- `orders`
- `payments/vnpay`
- `inventory`
- `dashboard`
- `blog`
- `contact`
- `uploads`

Mỗi domain thường có 4 lớp chính:

1. `route`
2. `controller`
3. `model`
4. `service` nếu domain có nghiệp vụ phức tạp

### Ví dụ với Orders

- `order.route.js`: định nghĩa endpoint
- `order.controller.js`: nhận request, validate mức controller, trả response
- `order.model.js`: schema MongoDB
- `order.service.js`: xử lý reserve stock, release stock, finalize COD, expire stale VNPay orders

### Cách nói khi thuyết trình

> Em tổ chức backend theo module, mỗi module xoay quanh một domain nghiệp vụ chứ không tổ chức theo kiểu technical folders chung. Nhờ đó, khi nhìn vào một domain như Orders, em có thể thấy đầy đủ route, controller, model và service của chính domain đó trong cùng một khu vực.

---

### 2.2. Tại sao cần Service Layer

Controller chỉ nên làm 3 việc:

1. nhận request
2. gọi nghiệp vụ
3. trả response

Phần nghiệp vụ phức tạp được đẩy sang service để controller không bị phình quá lớn.

### Ví dụ thực tế

Trong `order.service.js`, có các hàm:

- `createCheckoutOrder`
- `reserveOrderInventory`
- `releaseOrderInventory`
- `expireStalePendingVnpayOrders`
- `finalizeCodOrder`
- `markOrderPaid`
- `markOrderFailed`

Nếu dồn hết chúng vào controller thì file controller sẽ rất khó đọc và khó test.

### Cách nói khi thuyết trình

> Em tách service layer vì Orders và Inventory có nhiều bước nghiệp vụ liên tiếp. Nếu controller vừa đọc request vừa xử lý reserve stock, release stock, cleanup stale order và commit customer stats thì code sẽ rất khó bảo trì. Khi tách service, controller giữ vai trò mỏng và service trở thành nơi mô tả đúng quy trình nghiệp vụ.

---

## 3. Luồng Nghiệp vụ Xương sống (10 phút)

## 3.1. Auth Flow

### Tổng quan

Hệ thống có 2 luồng auth khác nhau:

- Admin auth
- Customer auth

Chúng được tách riêng ở:

- route
- controller
- refresh cookie name
- middleware bảo vệ

### Admin auth

- route: `apps/api/src/modules/auth/auth.route.js`
- refresh endpoint: `/api/auth/admin/refresh`
- middleware: `requireAdminAuth`
- refresh token lưu trong model `RefreshToken`

### Customer auth

- route: `apps/api/src/modules/customers/customer-auth.route.js`
- refresh endpoint: `/api/auth/customer/refresh`
- middleware: `requireCustomerAuth`
- refresh cookie name: `customerRefreshToken`

### Cách access và refresh token đang hoạt động

- Access Token:
  - sống ngắn, TTL khoảng 15 phút
  - dùng để authorize request thường ngày

- Refresh Token:
  - sống dài hơn, khoảng 7 ngày
  - được lưu trong DB qua `RefreshToken`
  - dùng để xin cấp Access Token mới

### Điểm quan trọng phải nói đúng với code

Hiện tại:

- access token và refresh token dùng chung `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET`
- nhưng tách bằng:
  - route namespace
  - middleware riêng
  - audience `aud`
  - cookie name riêng ở customer flow

`requireCustomerAuth` có check `payload.aud === "customer"`.  
`requireAdminAuth` hiện kiểm tra admin qua database nhưng chưa check `aud === "admin"` một cách chặt như customer middleware.

### Cách nói khi thuyết trình

> Em tách hoàn toàn admin flow và customer flow ở cấp route và middleware. Mỗi request đi vào admin hay customer đều qua middleware khác nhau. Customer middleware còn kiểm tra thêm audience của token để tránh dùng nhầm token. Nếu triển khai production chặt hơn nữa, em sẽ bổ sung luôn audience check cho admin middleware để đối xứng hoàn toàn.

### Nếu bị hỏi sâu

> Điểm em ưu tiên ở đây là giảm rủi ro nếu access token bị lộ bằng cách để token sống ngắn và dùng refresh token lưu trong database. Khi refresh token bị revoke hoặc account không còn hợp lệ, hệ thống sẽ từ chối cấp mới access token.

---

## 3.2. Inventory và Order Flow (Trọng tâm)

Đây là phần xương sống quan trọng nhất của dự án.

### Bản chất nghiệp vụ

Trong thương mại điện tử, khi người dùng tạo đơn thành công thì hệ thống phải:

1. kiểm tra tồn kho còn đủ không
2. giữ hàng lại để tránh oversell
3. hoàn hàng lại nếu đơn lỗi hoặc bị hủy

### Nguồn dữ liệu quan trọng

- `Product.stock`: số lượng thật hiện tại của sản phẩm
- `InventoryLog`: nhật ký lịch sử tăng/giảm stock

### Tại sao tách 2 thứ này

- `stock` phải truy vấn cực nhanh để phục vụ catalog và checkout
- `InventoryLog` dùng để audit, đối soát, debug và trả lời câu hỏi “vì sao stock thay đổi”

### Quy trình tạo đơn

Khi user checkout:

1. backend nhận items và shipping address
2. `buildOrderItems()` kiểm tra sản phẩm và số lượng
3. `createCheckoutOrder()` tạo bản ghi order
4. `reserveOrderInventory()` trừ stock
5. `syncProductInventoryStatus()` đồng bộ:
   - còn hàng thì `active`
   - hết hàng thì `out_of_stock`
6. `recordInventoryLog()` ghi lịch sử `order_reserved`

### Quy trình release inventory

Nếu order bị hủy hoặc payment fail:

1. `releaseOrderInventory(order)` cộng stock lại
2. `syncProductInventoryStatus()` cập nhật lại product status
3. `recordInventoryLog()` ghi lịch sử `order_released`

### VNPay stale order cleanup

Đây là một điểm rất đáng nói trong phản biện.

Với đơn VNPay:

- người dùng có thể tạo payment nhưng không thanh toán
- nếu không cleanup, inventory sẽ bị giữ treo

Hệ thống hiện có:

- `expireStalePendingVnpayOrders()`
- `expireOrderIfNeeded()`

Ý nghĩa:

- quét các đơn pending VNPay quá hạn
- đánh dấu failed / expired
- release inventory để trả stock về

### COD và doanh thu

Đây là điểm đã được chuẩn hóa khá tốt:

- VNPay:
  - gateway callback hợp lệ thì `paymentStatus = paid`
  - dashboard bắt đầu tính doanh thu

- COD:
  - lúc tạo đơn chỉ `paymentStatus = pending`
  - inventory vẫn bị reserve ngay
  - khi admin cập nhật `orderStatus = delivered`, backend tự chuyển COD sang `paid`
  - từ thời điểm đó dashboard mới cộng doanh thu

### Cách nói khi thuyết trình

> Em xem inventory là lõi nghiệp vụ của dự án. Khi tạo đơn, hệ thống không chỉ lưu order mà còn phải giữ hàng ngay để chống overselling. Nếu payment fail hoặc đơn bị hủy, stock được trả về và ghi log. Em cố tình tách Product.stock và InventoryLog vì một bên là dữ liệu vận hành hiện tại, còn một bên là nhật ký audit để biết nguyên nhân thay đổi.

---

## 3.3. Media Handling

### Upload flow hiện tại

Admin upload ảnh thông qua:

- `apps/api/src/modules/uploads/upload.controller.js`

Upload hiện hỗ trợ 2 mode:

1. Cloudinary nếu env được cấu hình
2. local disk fallback nếu Cloudinary chưa bật

Scope được phân loại theo:

- `products`
- `categories`
- `blog`

### Vai trò của Multer

Multer chịu trách nhiệm:

- parse multipart/form-data
- validate mime type
- giới hạn kích thước file
- nhận nhiều file cùng lúc

### Lưu ý rất quan trọng khi trình bày

Giải pháp local uploads phù hợp cho demo/local nhưng không phù hợp production trên Render vì filesystem là ephemeral.

### Cách nói nên dùng

> Ban đầu em dùng Multer để lưu ảnh vào local uploads cho nhanh và phù hợp với giai đoạn demo. Tuy nhiên sau khi kiểm thử nhóm, em nhận ra filesystem của Render không phù hợp để lưu media lâu dài. Vì vậy em đã chuẩn bị nhánh upload lên Cloudinary: nếu có đủ env thì backend sẽ upload buffer thẳng lên Cloudinary và DB lưu URL public bền vững. Đây là hướng production-ready hơn so với local uploads.

---

## 4. Tối ưu hóa và Hiệu năng (5 phút)

## 4.1. Client-side

### Lazy loading

Ở `apps/user/src/app/router.tsx`, các page đều được `lazy()`:

- Home
- Blog
- Products
- Product Detail
- Cart
- Wishlist
- Checkout pages

Ý nghĩa:

- giảm JS bundle tải ban đầu
- chỉ tải page khi người dùng thật sự truy cập

### Cache TTL và in-flight dedupe

Trong `apps/user/src/features/catalog/catalog.service.ts`:

- có cache response theo TTL
- có `inFlightRequests` để tránh gửi trùng request đang pending

Ví dụ:

- categories cache 10 phút
- filters cache 2 phút
- products cache 30 giây

### Cách nói khi thuyết trình

> Ở phía client em tối ưu bằng hai lớp. Lớp thứ nhất là lazy loading theo route để giảm tải ban đầu. Lớp thứ hai là cache TTL cộng với in-flight dedupe trong catalog service, giúp nếu nhiều component hoặc nhiều thao tác cùng hỏi một dữ liệu thì frontend không spam request giống nhau lên API.

---

## 4.2. Server-side

### Server-side pagination

Backend dùng pagination nhất quán qua:

- `getPagination()`
- `buildMeta()`

Áp dụng ở:

- Orders
- Customers
- Products
- Categories
- Blog
- Inventory logs
- Contact inquiries

### Ý nghĩa

- không kéo toàn bộ dữ liệu lớn về một lần
- tránh tăng RAM không cần thiết
- giảm payload response
- dễ làm bảng admin mượt hơn

### Cách nói khi thuyết trình

> Với các bảng admin, em không tải full data vì điều đó rất nhanh dẫn tới response lớn và tốn RAM ở cả server lẫn client. Em dùng pagination ngay từ backend để chỉ lấy đúng page cần xem, đồng thời trả thêm meta để frontend biết tổng số page và tổng số bản ghi.

---

# PHẦN 2: BỘ CÂU HỎI ĐÀO SÂU API 20 PHÚT

## Nhóm 1: Tính toàn vẹn dữ liệu (Consistency)

### Câu hỏi 1

**Hỏi:** Nếu hai người cùng mua một món hàng cuối cùng tại cùng một thời điểm, API xử lý thế nào?

**Đáp ngắn gọn:**

> Hiện tại em kiểm tra stock ngay trong `order.service.js` trước khi reserve inventory. Nghĩa là ở thời điểm tạo order, backend sẽ kiểm tra `product.stock` và chỉ cho giữ hàng nếu đủ số lượng. Đây là lớp bảo vệ nghiệp vụ hiện có.

**Đáp sâu hơn, trưởng thành hơn:**

> Tuy nhiên em cũng thừa nhận rằng để chống overselling tuyệt đối trong môi trường concurrent cao, cách production-ready hơn là dùng Mongoose transaction hoặc atomic update theo kiểu chỉ trừ stock nếu stock hiện tại vẫn đủ. Phần hiện tại phù hợp cho đồ án và scale demo, còn production em sẽ nâng cấp thêm lớp transaction/atomicity.

### Câu hỏi 2

**Hỏi:** Tại sao em không lưu stock trong InventoryLog mà lại lưu ở Product?

**Đáp:**

> Vì `Product.stock` là source of truth để phục vụ truy vấn vận hành hiện tại. Catalog, checkout và admin product list đều cần đọc số lượng còn lại rất nhanh, nên em lưu số lượng thật ở Product. `InventoryLog` chỉ là audit trail, dùng để biết ai hoặc nghiệp vụ nào đã làm stock thay đổi và thay đổi từ bao nhiêu sang bao nhiêu.

### Câu hỏi 3

**Hỏi:** Product `out_of_stock` có phải là bị xóa không?

**Đáp:**

> Không. `out_of_stock` chỉ là trạng thái tạm thời khi `stock` về 0. Product vẫn còn trong database, vẫn giữ lịch sử order và có thể quay lại `active` ngay khi admin restock hoặc hệ thống release inventory do đơn bị hủy.

---

## Nhóm 2: Bảo mật và Xác thực (Security)

### Câu hỏi 4

**Hỏi:** Làm sao em phân biệt request của Admin và Customer khi cả hai đều dùng JWT?

**Đáp đúng với code hiện tại:**

> Em tách bằng route namespace và middleware riêng: `requireAdminAuth` và `requireCustomerAuth`. Customer flow còn kiểm tra `aud` của token là `customer`. Ngoài ra admin và customer có refresh flow tách route riêng, cookie refresh riêng ở customer flow, và dữ liệu account được lookup ở model khác nhau.

**Nếu giảng viên hỏi tiếp “đã đủ chặt chưa?”**

> Với production em sẽ làm chặt hơn nữa bằng cách bổ sung `aud === admin` trong `requireAdminAuth` để đối xứng với customer middleware. Hiện tại em đã tách được hai flow nhưng vẫn còn chỗ có thể harden thêm.

### Câu hỏi 5

**Hỏi:** Nếu Access Token bị lộ, hệ thống có rủi ro gì?

**Đáp:**

> Rủi ro là kẻ xấu có thể dùng token đó trong thời gian token còn sống. Để thu hẹp cửa sổ rủi ro, em để Access Token có TTL ngắn khoảng 15 phút và dùng Refresh Token lưu trong DB để cấp mới Access Token. Khi refresh token bị revoke hoặc account không còn hợp lệ, hệ thống sẽ không cấp mới nữa.

### Câu hỏi 6

**Hỏi:** Tại sao cần cả Access Token lẫn Refresh Token?

**Đáp:**

> Vì nếu chỉ dùng một token sống rất dài thì rủi ro bảo mật cao. Nếu chỉ dùng token sống rất ngắn mà không có refresh thì trải nghiệm người dùng sẽ tệ. Access Token ngắn để bảo mật, Refresh Token dài hơn để giữ trải nghiệm đăng nhập.

---

## Nhóm 3: Xử lý lỗi và Edge Cases

### Câu hỏi 7

**Hỏi:** Điều gì xảy ra nếu khách đặt hàng qua VNPay nhưng không bao giờ thanh toán? Kho hàng có bị treo không?

**Đáp:**

> Em đã xử lý case này bằng stale VNPay cleanup. Hệ thống quét các đơn VNPay `pending` quá hạn, đánh dấu failed hoặc expired, sau đó gọi `releaseOrderInventory` để trả stock lại cho sản phẩm. Nhờ vậy inventory không bị treo mãi chỉ vì khách tạo đơn nhưng không hoàn tất thanh toán.

### Câu hỏi 8

**Hỏi:** Tại sao em dùng `asyncHandler` cho controller?

**Đáp:**

> Vì gần như toàn bộ controller đều là async. Nếu không có `asyncHandler`, em phải lặp lại `try/catch` ở từng controller hoặc có nguy cơ lỗi runtime lọt ra ngoài làm code rất bẩn. `asyncHandler` giúp bắt lỗi một lần và đẩy toàn bộ về `errorHandler` tập trung.

### Câu hỏi 9

**Hỏi:** Nếu admin cancel đơn thì chuyện gì xảy ra?

**Đáp:**

> Khi admin đổi order sang `cancelled`, backend cộng lại stock cho từng item trong order, đồng bộ lại product status nếu cần, và ghi `InventoryLog` với lý do `order_cancelled`. Điều này giúp dữ liệu stock hiện tại và lịch sử audit luôn khớp nhau.

### Câu hỏi 10

**Hỏi:** Với COD, tại sao không cộng doanh thu ngay khi admin bấm `Confirm`?

**Đáp:**

> Vì `Confirm` chỉ là xác nhận tiếp nhận và xử lý đơn, chưa phải xác nhận đã thu tiền. Trong dự án hiện tại, COD chỉ được chuyển sang `paid` khi `orderStatus = delivered`. Từ thời điểm đó dashboard mới cộng doanh thu. Em chọn cách này vì nó đúng nghiệp vụ giao hàng thu tiền hơn là cộng revenue quá sớm.

### Câu hỏi 11

**Hỏi:** Tại sao VNPay vẫn cần `Delivered` nếu payment đã là `paid`?

**Đáp:**

> Vì `paymentStatus` và `orderStatus` phản ánh hai việc khác nhau. `paid` nghĩa là đã thu tiền. `delivered` nghĩa là giao hàng thành công. Với VNPay, tiền có thể thu trước nhưng hàng vẫn chưa giao xong. Nên vẫn phải giữ bước `Delivered` để theo dõi vận hành logistics.

---

# MẸO GHI ĐIỂM KHI PHẢN BIỆN API

## 1. Luôn nói theo góc nhìn nghiệp vụ

Không nói:

> Em viết code như vậy vì em thấy hợp.

Nên nói:

> Về mặt nghiệp vụ bán lẻ, hệ thống cần giữ kho ngay khi tạo đơn để tránh overselling, nên em đặt reserve inventory ở backend thay vì frontend.

## 2. Phân biệt rõ “dữ liệu vận hành” và “dữ liệu audit”

Ví dụ:

- `Product.stock`: dữ liệu vận hành hiện tại
- `InventoryLog`: dữ liệu audit, giải thích lịch sử biến động

## 3. Thừa nhận giới hạn demo, nhưng nêu hướng production

Ví dụ cực tốt:

> Hiện tại phần upload ảnh đã hỗ trợ Cloudinary, còn local uploads chỉ là fallback phục vụ local/dev. Với production em sẽ ưu tiên object storage như Cloudinary hoặc S3 thay vì lưu vào filesystem của web service.

Ví dụ khác:

> Phần reserve stock hiện tại đã có kiểm tra nghiệp vụ, nhưng nếu cần chống race condition mạnh hơn ở production em sẽ nâng cấp bằng transaction hoặc atomic stock update.

## 4. Khi bị hỏi khó, trả lời theo công thức 3 bước

1. **Chốt bản chất nghiệp vụ**
2. **Nói code hiện tại đang làm gì**
3. **Nói hướng production nếu cần scale**

Ví dụ:

> Bản chất của COD là chưa thu tiền khi tạo đơn. Trong code hiện tại em reserve inventory ngay, nhưng chỉ ghi nhận doanh thu khi admin đánh dấu delivered vì lúc đó mới phù hợp với nghiệp vụ thu tiền khi giao hàng. Nếu scale production hơn, em có thể thêm payment reconciliation log hoặc settlement event riêng cho COD.

---

# GỢI Ý SLIDE 12 TRANG

## Slide 1

- Tên dự án: CyberShop
- Mục tiêu: storefront + admin + API cho bán lẻ điện tử

## Slide 2

- Kiến trúc 3-apps
- sơ đồ `user -> api <- admin`

## Slide 3

- API-centric
- middleware pipeline

## Slide 4

- module-based backend
- route / controller / model / service

## Slide 5

- auth flow admin vs customer
- access token + refresh token

## Slide 6

- order flow tổng quát
- create order -> reserve stock -> update status

## Slide 7

- inventory flow
- stock vs inventory log

## Slide 8

- VNPay stale cleanup
- COD revenue recognized on delivery

## Slide 9

- upload ảnh
- local vs Cloudinary

## Slide 10

- client optimization
- lazy loading + cache TTL + in-flight dedupe

## Slide 11

- server optimization
- pagination + filtered queries

## Slide 12

- Q&A chuẩn bị sẵn
- production improvements

---

# PHIÊN BẢN NÓI MIỆNG 60-90 GIÂY ĐỂ MỞ ĐẦU

> Dự án của em là một hệ thống bán lẻ điện tử gồm 3 ứng dụng tách biệt: storefront cho khách hàng, admin cho vận hành nội bộ, và backend API làm trung tâm nghiệp vụ. Em chọn hướng API-centric, nghĩa là toàn bộ logic quan trọng như xác thực, tạo đơn, giữ kho, thanh toán VNPay, quản lý inventory và dashboard đều nằm ở backend.  
>  
> Về mặt kỹ thuật, backend được tổ chức theo module domain, mỗi module gồm route, controller, model, và với các domain phức tạp như Orders thì có thêm service layer để chứa nghiệp vụ. Trọng tâm lớn nhất của dự án là luồng order và inventory: khi tạo đơn hệ thống phải reserve stock, khi đơn lỗi hoặc bị hủy phải release stock, đồng thời ghi inventory log để phục vụ audit.  
>  
> Ngoài ra em cũng tối ưu cả client và server bằng lazy loading, cache TTL, in-flight dedupe ở frontend, và pagination ở backend. Trong phần phản biện em sẽ tập trung trả lời các câu hỏi về consistency, security và edge cases, vì đó là các điểm thể hiện rõ nhất tư duy backend của dự án.

---

# PHIÊN BẢN TRẢ LỜI CỰC NGẮN CHO GIẢNG VIÊN

## Nếu bị hỏi “phần mạnh nhất của dự án là gì?”

> Phần mạnh nhất là order-inventory flow, vì đó là nơi em gom cả business logic, payment edge cases và tính toàn vẹn dữ liệu vào cùng một trục xử lý.

## Nếu bị hỏi “điểm nào em thấy còn có thể nâng cấp?”

> Em sẽ nâng cấp hai điểm theo hướng production: thứ nhất là atomicity/transaction mạnh hơn cho reserve stock khi concurrent cao; thứ hai là đẩy toàn bộ media sang object storage để tách hẳn khỏi filesystem của web service.

## Nếu bị hỏi “điểm gì thể hiện tư duy kiến trúc?”

> Em nghĩ rõ nhất là việc tách 3 apps và giữ backend theo hướng API-centric, để logic nghiệp vụ không bị rơi vào frontend.

