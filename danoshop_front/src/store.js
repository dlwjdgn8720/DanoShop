import { configureStore, createSlice } from "@reduxjs/toolkit";

const selectedOptions = createSlice({
  name: "selectedOptions",
  initialState: [],
  reducers: {
    addSelectedOption(state, action) {
      state.push(action.payload);
    },
    removeSelectedOption(state, action) {
      return state.filter((option) => option !== action.payload);
    },
    clearSelectedOptions() {
      return [];
    },
  },
});

export const { addSelectedOption, removeSelectedOption, clearSelectedOptions } = selectedOptions.actions;

const cart = createSlice({
  name: "cart",
  initialState: {
    items: [
      {
        id: "12",
        image: "https://he0o0nje.github.io/Danoshop-clone-ts/img/main/3pm/01.png",
        name: "[다노] 프로틴 snack eat 옥수수맛_저칼로리 식단관리 간식",
        price: "2,600원",
        sale_price: "2,080원",
        option: "프로틴 snack eat 옥수수맛(1개)",
        quantity: 5,
      },
      {
        id: "16",
        image: "https://he0o0nje.github.io/Danoshop-clone-ts/img/main/6pm/01.webp",
        name: "[다노] 단백질 도시락 7종 세트_식단관리 고단백 냉동도시락",
        price: "31,500원",
        sale_price: "",
        option: "단백질 도시락(1세트)",
        quantity: 1,
      },
      {
        id: "9",
        image: "https://he0o0nje.github.io/Danoshop-clone-ts/img/main/1pm/03.png",
        name: "[다노] 닭가슴살 큐브_식단관리 닭가슴살",
        price: "10,000원",
        sale_price: "",
        option: "큐브 닭가슴살_오리지널(5개)",
        quantity: 3,
      },
    ],
  },
  reducers: {
    addCount(state, action) {
      const product = state.items.find((item) => item.id === action.payload);
      if (product) {
        product.quantity += 1;
        product.finalPrice = (parseFloat(product.price.replace(/,/g, "")) * product.quantity).toLocaleString();
      }
    },
    decreaseCount(state, action) {
      const product = state.items.find((item) => item.id === action.payload);
      if (product && product.quantity > 0) {
        product.quantity -= 1;
        product.finalPrice = (parseFloat(product.price.replace(/,/g, "")) * product.quantity).toLocaleString();
      } else if (product && product.quantity === 0) {
        alert("상품이 더 이상 없습니다.");
      }
    },
    addItem(state, action) {
      action.payload.forEach((productItem) => {
        const product = state.items.find((item) => item.id === productItem.id);
        if (product) {
          product.quantity += 1;
          product.finalPrice = (parseFloat(product.price.replace(/,/g, "")) * product.quantity).toLocaleString();
          product.options = productItem.options;
        } else {
          state.items.push({
            ...productItem,
            quantity: 1,
            finalPrice: productItem.price,
            options: productItem.options,
          });
        }
      });
    },
    deleteItem(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { addCount, decreaseCount, addItem, deleteItem } = cart.actions;

const calculatePrice = createSlice({
  name: "calculatePrice",
  initialState: {
    calculateItemPrice: [0],
    totalDiscount: 0,
    totalPrice: 0,
    finalPrice: 0,
  },
  reducers: {
    calculateItemPrice(state, action) {
      const { items } = action.payload;
      state.calculateItemPrice = items.map((item) => {
        const quantity = item.quantity;
        const price = item.sale_price ? parseInt(item.sale_price.replace(/,/g, ""), 10) : parseInt(item.price.replace(/,/g, ""), 10);
        return quantity * price;
      });
    },
    totalDiscount(state, action) {
      const { items } = action.payload;
      state.totalDiscount = items
        .filter((item) => item.sale_price)
        .reduce((total, item) => {
          const price = parseInt(item.price.replace(/원/g, "").replace(/,/g, ""), 10);
          const salePrice = parseInt(item.sale_price.replace(/원/g, "").replace(/,/g, ""), 10);
          return total + (price - salePrice) * item.quantity;
        }, 0);
    },
    totalPrice(state, action) {
      const { items } = action.payload;
      state.totalPrice = items
        .map((item) => {
          const quantity = item.quantity;
          const price = item.sale_price ? parseInt(item.sale_price.replace(/,/g, ""), 10) : parseInt(item.price.replace(/,/g, ""), 10);
          return quantity * price;
        })
        .reduce((total, itemPrice) => total + itemPrice, 0);
    },
    finalPrice(state, action) {
      const { items } = action.payload;
      const totalPrice = items
        .map((item) => {
          const quantity = item.quantity;
          const price = item.sale_price ? parseInt(item.sale_price.replace(/,/g, ""), 10) : parseInt(item.price.replace(/,/g, ""), 10);
          return quantity * price;
        })
        .reduce((total, itemPrice) => total + itemPrice, 0);
      const shippingFee = totalPrice > 50000 ? 0 : 3500;
      const totalDiscount = items
        .filter((item) => item.sale_price)
        .reduce((total, item) => {
          const price = parseInt(item.price.replace(/원/g, "").replace(/,/g, ""), 10);
          const salePrice = parseInt(item.sale_price.replace(/원/g, "").replace(/,/g, ""), 10);
          return total + (price - salePrice);
        }, 0);
      state.finalPrice = totalPrice + shippingFee - totalDiscount;
    },
  },
});

export const { calculateItemPrice, totalDiscount, totalPrice, finalPrice } = calculatePrice.actions;

const detail = createSlice({
  name: "detail",
  initialState: {},
  reducers: {
    setDetail(state, action) {
      return { ...state, ...action.payload };
    },
  },
});

export const { setDetail } = detail.actions;

const products = createSlice({
  name: "products",
  initialState: [],
  reducers: {
    setProducts(state, action) {
      return action.payload;
    },
  },
});

export const { setProducts } = products.actions;

const store = configureStore({
  reducer: {
    selectedOptions: selectedOptions.reducer,
    cart: cart.reducer,
    calculatePrice: calculatePrice.reducer,
    detail: detail.reducer,
    products: products.reducer,
  },
});

export default store;
