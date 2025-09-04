import React from "react";
import Navbar from "./navbar";
import { Outlet } from 'react-router-dom';
import Footer from "./footer";

function Layout() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Outlet/>
            </main>
            <Footer />
        </div>
    );
}

export default Layout;
