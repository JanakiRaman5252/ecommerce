import React, { useEffect } from "react";
import Banner from "../components/home/Banner";
import ProductsPage from "./ProductsPage";
import { randomValue} from '../GenerateCardCode'
function HomePage() {
  useEffect(() => {
    if (localStorage.getItem("cart_code") === null) {
      localStorage.setItem("cart_code", randomValue)
    }
  }, []);
  return (
    <>
    <Banner/>
    <ProductsPage/>
    </>
  );
}

export default HomePage;
