/* eslint-disable react/prop-types */
import {createContext, useEffect, useState} from "react";
import axios from 'axios';


export const UserContext = createContext({});

export function UserContextProvider({children}){
  const [user, setUser ] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      axios.get('/api/users/profile').then(({data}) => {
        setUser(data);
      }).catch(() => {
        setUser(null);
      }).finally(() => {
        setLoading(false);
      });
    }
  },[]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={{user, setUser}}>
      {children}
    </UserContext.Provider>
  )
}