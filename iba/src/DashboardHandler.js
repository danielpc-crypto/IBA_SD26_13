import React, { useState, useEffect } from 'react';
import FullDashboard from "./FullDashboard";
import UploadDashboard from "./UploadDashboard";

function DashboardHandler() {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    const [user, setUser] = useState(storedUser);
    const [hasData, setHasData] = useState(storedUser.business_data_uploaded === 1);

    const handleUploadComplete = async () => {
        const updatedUser = { ...user, business_data_uploaded: 1 };
        setUser(updatedUser);
        setHasData(true);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    if(!user) {
        return <div>Loading...</div>;
    }

    return hasData ? (<FullDashboard />) : (<UploadDashboard onUploadSuccess={handleUploadComplete} />);

}

export default DashboardHandler;