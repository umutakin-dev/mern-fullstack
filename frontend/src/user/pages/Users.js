import React from "react";

import UsersList from "../components/UsersList";

const Users = () => {
  const USERS = [
    {
      id: "u1",
      name: "umut akin",
      image:
        "https://3.bp.blogspot.com/-hIZdzZipHGQ/T_xf8BYswyI/AAAAAAAAA1o/trv7LbmwZw4/s1600/cat+17.jpg",
      places: 3,
    },
  ];

  return <UsersList items={USERS} />;
};

export default Users;
