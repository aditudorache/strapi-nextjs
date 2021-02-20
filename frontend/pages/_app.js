import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Cookie from 'js-cookie';
import fetch from 'isomorphic-fetch';
import Layout from '../components/Layout';
import AppContext from '../context/AppContext';
import withApollo from '../lib/apollo';

const App = ({ Component, pageProps }) => {
  const [user, setUser] = useState();

  useEffect(() => {
    // grab token value from cookie
    const token = Cookie.get('token');

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

  return (
    <AppContext.Provider
    value={{
      user: user,
      isAuthenticated: !!user,
      setUser,
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
