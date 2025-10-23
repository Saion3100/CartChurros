// ===== メニュー定義 =====
const menuData = [
    { id: 1, name: "プレーン" },
    { id: 2, name: "シュガー" },
    { id: 3, name: "シナモン" },
    { id: 4, name: "ココア" },
    { id: 5, name: "スペシャル" },
    { id: 6, name: "サービス" }
];

const basePrice = 150;
const toppingPrice = 10;

// ===== データ構造 =====
let cartData = {
    churrosList: [], // [{flavor_id, topping}]
    service: 0
};

// ===== 要素参照 =====
const menuList = document.getElementById("menu-list");
const cartItems = document.getElementById("cart-items");
const totalPriceEl = document.getElementById("total-price");
const cartCountEl = document.getElementById("cart-count");
const overlay = document.getElementById("cart-overlay");

// ===== メニュー生成 =====
menuData.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("menu-item");

    if (item.name === "サービス") {
        // サービス専用
        div.classList.add("service");
        div.innerHTML = `
            <h2>${item.name}</h2>
            <p>0円</p>
            <button class="service">あり</button>
        `;
        div.querySelector("button").addEventListener("click", () => addService());
    } else {
        // 通常メニュー
        //縦並び
        // div.innerHTML = `
        //     <h2>${item.name}</h2>
        //     <p>${basePrice}円</p>
        //     <button class="with">トッピングあり</button>
        //     <button class="without">トッピングなし</button>
        // `;

        div.innerHTML = `
    <h2>${item.name}</h2>
    <p>${basePrice}円</p>
    <div class="menu-item-buttons">
        <button class="with">あり</button>
        <button class="without">なし</button>
    </div>
`;
        div.querySelector(".with").addEventListener("click", () => addToCart(item.id, true));
        div.querySelector(".without").addEventListener("click", () => addToCart(item.id, false));
    }

    menuList.appendChild(div);
});

// ===== カートに追加 =====
function addToCart(flavor_id, hasTopping) {
    cartData.churrosList.push({
        flavor_id,
        topping: hasTopping ? 1 : 0
    });

    updateCart();
}

// ===== サービス追加 =====
function addService() {
    cartData.service = 1;
    updateCart();
}

// ===== カート更新 =====
function updateCart() {
    cartItems.innerHTML = "";
    let total = 0;

    const grouped = {};

    cartData.churrosList.forEach(item => {
        const key = `${item.flavor_id}-${item.topping}`;
        if (!grouped[key]) grouped[key] = { ...item, count: 0 };
        grouped[key].count++;
    });

    Object.values(grouped).forEach(item => {
        const flavor = menuData.find(f => f.id === item.flavor_id);
        const toppingText = item.topping ? "トッピングあり" : "トッピングなし";
        const price = basePrice + (item.topping ? toppingPrice : 0);
        const subtotal = price * item.count;

        const row = document.createElement("div");
        row.classList.add("cart-item");
        row.innerHTML = `
            <span>${flavor.name}（${toppingText}） × ${item.count}</span>
            <button data-flavor="${item.flavor_id}" data-topping="${item.topping}">−</button>
        `;

        row.querySelector("button").addEventListener("click", e => {
            const fId = parseInt(e.target.dataset.flavor);
            const topping = parseInt(e.target.dataset.topping);
            const index = cartData.churrosList.findIndex(
                i => i.flavor_id === fId && i.topping === topping
            );
            if (index !== -1) {
                cartData.churrosList.splice(index, 1);
            }
            updateCart();
        });

        cartItems.appendChild(row);
        total += subtotal;
    });

    // サービス
    if (cartData.service === 1) {
        const serviceDiv = document.createElement("div");
        serviceDiv.classList.add("cart-item", "service-item");
        serviceDiv.textContent = "サービスあり";
        cartItems.appendChild(serviceDiv);
    }

    totalPriceEl.textContent = total;
    cartCountEl.textContent = cartData.churrosList.length;
}

// ===== カート開閉 =====
document.getElementById("open-cart-btn").addEventListener("click", () => {
    overlay.style.display = "flex";
});
document.getElementById("close-cart-btn").addEventListener("click", () => {
    overlay.style.display = "none";
});
overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.style.display = "none";
});

// ===== 登録ボタン押下 =====
document.getElementById("register-btn").addEventListener("click", () => {
    if (cartData.churrosList.length === 0 && cartData.service === 0) {
        alert("カートが空です！");
        return;
    }

    // DB送信用データ
    const payload = {
        churrosList: cartData.churrosList.map(i => ({
            flavor_id: i.flavor_id,
            topping: i.topping
        })),
        service: cartData.service
    };

    console.log("送信データ:", payload);

    // 表示用
    const summary = Object.values(
        cartData.churrosList.reduce((acc, i) => {
            const key = `${i.flavor_id}-${i.topping}`;
            if (!acc[key]) acc[key] = { ...i, count: 0 };
            acc[key].count++;
            return acc;
        }, {})
    ).map(i => {
        const flavor = menuData.find(f => f.id === i.flavor_id);
        const toppingText = i.topping ? "トッピングあり" : "トッピングなし";
        return `${flavor.name}（${toppingText}） × ${i.count}`;
    }).join("\n");

    const serviceText = cartData.service === 1 ? "\nサービスあり" : "";

    alert("以下の内容で登録しました：\n\n" + summary + serviceText + `\n\n合計: ${totalPriceEl.textContent}円`);

    // カートリセット
    cartData = { churrosList: [], service: 0 };
    updateCart();
    overlay.style.display = "none";
});
