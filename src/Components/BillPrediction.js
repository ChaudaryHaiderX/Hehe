import React, {useState } from 'react';
import '../StyleSheet/Assets/styles.css';
import '../StyleSheet/Logout.css';
// import axios from 'axios';
import { Link } from 'react-router-dom';


const BillPrediction = () => {

    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const handleIconClick = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const handleLogoutClick = () => {
        // Handle logout logic here
        console.log('Logout successful');
    };

    return (
        <div style={{ paddingTop: '4.6%' }}>

            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossOrigin="anonymous" />

            {/* nav */}
            <header>
                <div className="header-path" style={{ fontSize: '18.5px', fontFamily: 'Arial, sans-serif' }}>Dashboard &nbsp; / &nbsp; Load Shedding Calculation</div>
                <div className="user-nav" style={{ fontSize: '18.5px' }}>User</div>
                <div className="custom-dropdown" id="dropdown" onClick={handleIconClick}>
                    <i className="fas fa-user-circle icon-nav"></i>
                    {isDropdownOpen && (
                        <div className="dropdown-content" style={{ margin: '20px 67% 20px -40px' }}>
                            <Link style={{ color: 'white', textDecoration: 'none' }} to="/signin" onClick={handleLogoutClick}>Logout</Link>
                        </div>
                    )}
                </div>
            </header>

            <div style={{ position: 'fixed', fontFamily: 'Arial, sans-serif', paddingTop: '20px' }} className="sidebar">
                <nav>
                    <ul className="list-group">
                        <li><Link style={{ paddingLeft: '12px', paddingRight: '12px' }} to="/dashboard">DASHBOARD</Link></li>
                        <li><Link style={{ paddingLeft: '12px', paddingRight: '12px' }} to="/loadShd">LOAD SHEDDING CALCULATION</Link></li>
                        <li><Link style={{ paddingLeft: '12px', paddingRight: '12px' }} to="/uploadReport">UPLOAD REPORT</Link></li>
                        <li><Link style={{ paddingLeft: '12px', paddingRight: '12px' }} to="/reportGen">BILL REPORT GENERATOR</Link></li>
                        <li style={{ padding: '0px', borderRadius: '5px', backgroundColor: '#9A0A0F' }}><Link style={{ paddingLeft: '12px', paddingRight: '12px' }} to="/billPre">BILL PREDICTION</Link></li>
                        {/* Add more sidebar items here */}
                    </ul>
                </nav>
            </div>

            {/* Main Form */}
            <div style={{ marginLeft: '278px' }} className="main-form">
                {/* 1 */}
                <div style={{ marginRight: '60px' }} className="row main-inputs">
                    <div style={{ display: 'flex' }} className="col-4">
                        <label style={{ paddingLeft: '12px', width: '120px' }} className="form-label">Main Region</label>
                        <div className="col-7">
                            <select className="form-select form-select-sm inputState">
                                <option selected>Choose...</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', paddingLeft: '40px' }} className="col-4">
                        <label style={{ width: '120px' }} className="form-label">Commercial Region</label>
                        <div className="col-8">
                            <select className="form-select form-select-sm inputState">
                                <option selected>Choose...</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', paddingLeft: '40px' }} className="col-4">
                        <label style={{ width: '120px', textAlign: 'center' }} className="form-label">MBU</label>
                        <div className="col-8">
                            <select className="form-select form-select-sm inputState">
                                <option selected>Choose...</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2 */}
                <div style={{ marginRight: '60px' }} className="row main-inputs">
                    <div style={{ display: 'flex' }} className="col-4">
                        <label style={{ width: '120px', textAlign: 'center' }} className="form-label">Site Code</label>
                        <div className="col-7">
                            <select className="form-select form-select-sm inputState">
                                <option selected>Choose...</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', paddingLeft: '40px' }} className="col-4">
                        <label style={{ width: '120px' }} className="form-label">From</label>
                        <div className="col-8">
                            <input style={{ marginLeft: '47px', textAlign: 'center' }} type="month" className="form-control form-control-sm" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', paddingLeft: '40px' }} className="col-4">
                        <label style={{ width: '120px', textAlign: 'center' }} className="form-label">To</label>
                        <div className="col-8">
                            <input style={{ textAlign: 'center' }} type="month" className="form-control form-control-sm" />
                        </div>
                    </div>
                </div>

                {/* button */}
                <div style={{ textAlign: 'right', padding: '15px 32px 15px 0px' }} className="submit-btn data-controls">
                    <button style={{ fontWeight: '600', marginTop: '30px' }} type="submit">Show Bill</button>
                    <input style={{ textAlign: 'center', backgroundColor: 'white', borderRadius: '4px' }} type="text" placeholder="Predicted Bill" readOnly disabled />
                </div>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossOrigin="anonymous"></script>

        </div>

    );
};

export default BillPrediction;
