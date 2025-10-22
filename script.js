const menuData = [
    "プレーン", "シュガー", "シナモン", "ココア", "アソート"
];
const basePrice = 150;
const toppingPrice = 10;

const cart = {};

const menuList = document.getElementById("menu-list");
const cartItems = document.getElementById("cart-items");
const totalPriceEl = document.getElementById("total-price");
const cartCountEl = document.getElementById("cart-count");
const overlay = document.getElementById("cart-overlay");

// メニュー生成
menuData.forEach(flavor => {
    const div = document.createElement("div");
    div.classList.add("menu-item");
    div.innerHTML = `
        <h2>${flavor}</h2>
        <p>150円</p>
        <button class="with">トッピングあり</button>
        <button class="without">トッピングなし</button>
      `;
    const withBtn = div.querySelector(".with");
    const withoutBtn = div.querySelector(".without");

    withBtn.addEventListener("click", () => addToCart(flavor, true));
    withoutBtn.addEventListener("click", () => addToCart(flavor, false));

    menuList.appendChild(div);
});

// カートに追加
function addToCart(flavor, hasTopping) {
    const key = `${flavor}（トッピング${hasTopping ? "あり" : "なし"}）`;
    if (!cart[key]) {
        cart[key] = { price: basePrice + (hasTopping ? toppingPrice : 0), count: 0 };
    }
    cart[key].count++;
    updateCart();
}

// カート更新
function updateCart() {
    cartItems.innerHTML = "";
    let total = 0;
    let totalCount = 0;

    Object.entries(cart).forEach(([name, item]) => {
        const row = document.createElement("div");
        row.classList.add("cart-item");
        row.innerHTML = `
          <span>${name} × ${item.count}</span>
          <button data-name="${name}">−</button>
        `;
        row.querySelector("button").addEventListener("click", e => {
            const key = e.target.dataset.name;
            cart[key].count--;
            if (cart[key].count <= 0) delete cart[key];
            updateCart();
        });

        cartItems.appendChild(row);
        total += item.price * item.count;
        totalCount += item.count;
    });

    totalPriceEl.textContent = total;
    cartCountEl.textContent = totalCount; // バッジ更新
}

// カート開閉
document.getElementById("open-cart-btn").addEventListener("click", () => {
    overlay.style.display = "flex";
});
document.getElementById("close-cart-btn").addEventListener("click", () => {
    overlay.style.display = "none";
});
overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.style.display = "none";
});

// 登録ボタン押下
document.getElementById("register-btn").addEventListener("click", () => {
    if (Object.keys(cart).length === 0) {
        alert("カートが空です！");
        return;
    }

    const orderSummary = Object.entries(cart)
        .map(([name, item]) => `${name} × ${item.count}`)
        .join("\n");

    alert("以下の内容で登録しました：\n\n" + orderSummary + `\n\n合計: ${totalPriceEl.textContent}円`);

    // 登録後リセット
    for (const key in cart) delete cart[key];
    updateCart();
    overlay.style.display = "none";
});