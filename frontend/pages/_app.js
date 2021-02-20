import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import Cookie from 'js-cookie';
import fetch from 'isomorphic-fetch';
import Layout from '../components/Layout';
import AppContext from '../context/AppContext';
import withApollo from '../lib/apollo';

const App = ({ Component, pageProps }) => {
  const [user, setUser] = useState();
  const [cart, setCart] = useState({ items: [], total: 0 });

  useEffect(() => {
    // grab token value from cookie
    const token = Cookie.get('token');
    // restore cart from cookie, this could also be tracked in a db
    const cartValue = Cookie.get('cart');
    //if items in cart, set items and total from cookie
    console.log(cartValue);

    if (typeof cartString === 'string' && cartValue !== 'undefined') {
      console.log('foyd');
      JSON.parse(cartValue).forEach((item) => {
        setCart({
          items: JSON.parse(cartValue),
          total: item.price * item.quantity,
        });
      });
    }

    if (token) {
      // authenticate the token on the server and place set user object
      fetch(`${process.env.NEXT_PUBLIC_API_URL}users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(async (res) => {
        // if res comes back not valid, token is not valid
        // delete the token and log the user out on client
        if (!res.ok) {
          Cookie.remove('token');
          setUser(null);
          return null;
        }
        const user = await res.json();
        setUser(user);
      });
    }
  }, []);

  const addItem = useCallback((item) => {
    let { items } = cart;
    //check for item already in cart
    //if not in cart, add item if item is found increase quanity ++
    const newItem = items.find((i) => i.id === item.id);
    // if item is not new, add to cart, set quantity to 1
    if (!newItem) {
      //set quantity property to 1
      const cartItem = {...item, quantity: 1};
      console.log(cart.total, cartItem.price);
      const cartItems = [...items, cartItem];
      setCart({
        items: cartItems,
        total: cart.total + cartItem.price,
      });
      Cookie.set('cart', cartItems);
    } else {
      const cartItems = cart.items.map((item) =>
        item.id === newItem.id
          ? Object.assign({}, item, { quantity: item.quantity + 1 })
          : item
      );
      setCart({
        items: cartItems,
        total: cart.total + item.price,
      });
      Cookie.set('cart', cartItems);
    }
  }, [cart]);

  const removeItem = useCallback((item) => {
    let { items } = cart;
    //check for item already in cart
    //if not in cart, add item if item is found increase quanity ++
    const newItem = items.find((i) => i.id === item.id);
    if (newItem.quantity > 1) {
      const cartItems = cart.items.map((item) =>
        item.id === newItem.id
          ? Object.assign({}, item, { quantity: item.quantity - 1 })
          : item
      );
      setCart({
        items: cartItems,
        total: cart.total - item.price,
      });
      Cookie.set('cart', cartItems);
    } else {
      const items = [...cart.items];
      const index = items.findIndex((i) => i.id === newItem.id);
      items.splice(index, 1);
      setCart({ items: items, total: cart.total - item.price });
      Cookie.set('cart', items);
    }
  }, [cart]);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        setUser,
        cart: cart,
        addItem,
        removeItem,
      }}
    >
      <Head>
        <link
          rel='stylesheet'
          href='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css'
          integrity='sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm'
          crossOrigin='anonymous'
        />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppContext.Provider>
  );
};

export default withApollo({})(App);
