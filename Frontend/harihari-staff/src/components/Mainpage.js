import React, { useState, useEffect, useLayoutEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import tableService from "../services/table.service.js";
import orderService from "../services/order.service.js";
import socketIOClient from "socket.io-client";

//CSS
import "../css/page.css";
import "../css/text.css";
import "../css/components/Mainpage.css";
import "../css/components/Popup.css";

//Icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faBell } from "@fortawesome/free-solid-svg-icons";
import closeIcon from "../images/Union 12.svg";

export default function Mainpage() {
  const [link, setLink] = useState();
  const [order, setOrder] = useState();
  const [selectedTable, setCurrentTable] = useState(1);
  const [qrPopup, setQR] = useState(false);
  const [showCam, setShowCam] = useState(false);
  const [orderMenu, setOrderMenu] = useState();
  const [customMenu, setCustomMenu] = useState();
  const [orderSelect, setOrderSelect] = useState(false);
  const [selectOrder, setSelectOrder] = useState("");
  const [showCheckOut, setCheckOut] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInput = socketIOClient("http://localhost:3030/harihari-staff");
    setSocket(socketInput);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("order-status", (result) => {
        if (
          parseInt(document.getElementById("myTableId").innerText.slice(6)) ===
          result.table_id
        ) {
          setOrder(result.orders);
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("call-waiter", (table) => {
        setLink(table);
      });
    }
  }, [socket]);

  const checkOut = async (value) => {
    let id = value.split("$");

    let result = await tableService.checkout(id[0], id[1]);

    if (result.success) {
      setCheckOut(true);
      setQR(true);
    }
  };

  useEffect(() => {
    if (!link) {
      getLink();
    }
  }, [link]);

  useLayoutEffect(() => {
    if (link) getOrder(link[selectedTable - 1].guest_uid);
  }, [link, selectedTable]);

  function openQR(value) {
    let web = "http://localhost:3000/";
    let path = web + "en/table/" + value;
    window.open(path, "_blank");
  }

  const getLink = async () => {
    return await tableService.getTables().then((data) => {
      setLink(data);
    });
  };

  const getOrder = async (value) => {
    return await orderService
      .getOrderHistory(value)
      .then((data) => setOrder(data));
  };

  const orderClick = (menu, custom) => {
    setOrderMenu(menu);
    setCustomMenu(custom);
    setOrderSelect(true);
  };

  const getIndexStatus = (index) => {
    setSelectOrder(index.order_id);
  };

  const changeStatus = async (e) => {
    let order = [];
    order.order_id = selectOrder;
    order.status = e.target.value;

    let result = await orderService.updateStatus(
      order,
      link[selectedTable - 1].guest_uid
    );

    if (result.success) {
      console.log("success");
    } else {
      console.log("unsuccess");
    }
  };

  const subTotal = (order, custom) => {
    var tempSum = 0;
    if (order) {
      for (let i = 0; i < order.length; i++) {
        tempSum = tempSum + order[i].quantity * order[i].price;
      }
    }
    if (custom) {
      for (let i = 0; i < custom.length; i++) {
        tempSum = tempSum + custom[i].quantity * custom[i].price;
      }
    }
    return tempSum;
  };

  const callWaiterClick = async () => {
    let result = await tableService.callWaiter(
      link[selectedTable - 1].guest_uid
    );
    if (result.success) {
      console.log("success");
    } else {
      console.log("unsuccess");
    }
  };

  return (
    <div>
      {qrPopup !== false && (
        <div id="qr-popup-section" className="section popup">
          <div id="qr-popup" className="page-container">
            <h1 className="nm-text qr-table-name">Table {selectedTable}</h1>
            {showCheckOut === true && (
              <h1 className="sm-text qr-table-name status-text">
                Check Out Success
              </h1>
            )}
            {link && showCheckOut === false && (
              <img
                className="qr-code"
                src={
                  "https://chart.googleapis.com/chart?cht=qr&chl=" +
                  "http://localhost:3000/" +
                  "en/" +
                  "table/" +
                  link[0].guest_uid +
                  "&chs=160x160&chld=L|0"
                }
                alt=""
                onClick={() => openQR(link[selectedTable - 1].guest_uid)}
              ></img>
            )}
            <div
              className="closeIcon"
              onClick={() => {
                setQR(!qrPopup);
                setCheckOut(false);
              }}
            >
              <img src={closeIcon} alt=""></img>
            </div>
          </div>
        </div>
      )}

      {orderSelect && (
        <div id="order-info-popup" className="section popup">
          <div id="info-popup" className="page-container">
            <div id="info-header">
              <h1 className="sm-text">Name</h1>
              <h1 className="sm-text">Comment</h1>
              <h1 className="sm-text">Quantity</h1>
              <h1 className="sm-text info-price-text">Price</h1>
            </div>

            <div id="info-menu-section">
              {orderMenu &&
                orderMenu.map((menu, id) => (
                  <div id="order-info-table">
                    <h1 className="sm-text">{menu.en}</h1>
                    {menu.comment ? (
                      <h1 className="sm-text">{menu.comment}</h1>
                    ) : (
                      <h1 className="sm-text">-</h1>
                    )}
                    <h1 className="sm-text">{menu.quantity}</h1>
                    <h1 className="sm-text info-price-text">
                      {menu.price.toFixed(2)}
                    </h1>
                  </div>
                ))}
              {customMenu &&
                customMenu.map((menu, id) => (
                  <div>
                    <div id="order-info-table">
                      <h1 className="sm-text">Custom Ramen</h1>
                      {menu.comment ? (
                        <h1 className="sm-text">{menu.comment}</h1>
                      ) : (
                        <h1 className="sm-text">-</h1>
                      )}
                      <h1 className="sm-text">{menu.quantity}</h1>
                      <h1 className="sm-text info-price-text">
                        {menu.price.toFixed(2)}
                      </h1>
                    </div>
                    <div>
                      <h1 className="xm-text gray-text">
                        {menu.en.soup_type},{menu.en.noodle},
                        {menu.en.spring_onion},{menu.en.garlic},{menu.en.spice},
                        {menu.en.chashu},{menu.en.richness}
                      </h1>
                    </div>
                  </div>
                ))}
            </div>

            {orderMenu && (
              <div id="info-price-box">
                <div className="info-price">
                  <h1 className="sm-text">Subtotal</h1>
                  <h1 className="sm-text">
                    {subTotal(orderMenu, customMenu).toFixed(2)}
                  </h1>
                </div>
                <div className="info-price">
                  <h1 className="sm-text">VAT (7%)</h1>
                  <h1 className="sm-text">
                    {(subTotal(orderMenu, customMenu) * 0.07).toFixed(2)}
                  </h1>
                </div>
                <div className="info-price">
                  <h1 className="sm-text total">Total</h1>
                  <h1 className="sm-text total">
                    ฿{" "}
                    {(
                      subTotal(orderMenu, customMenu) +
                      subTotal(orderMenu, customMenu) * 0.07
                    ).toFixed(2)}
                  </h1>
                </div>
              </div>
            )}

            <div
              className="closeIcon"
              onClick={() => {
                setOrderSelect(!orderSelect);
                setOrderMenu(null);
              }}
            >
              <img src={closeIcon} alt=""></img>
            </div>
          </div>
        </div>
      )}

      <div id="mainpage" className="section">
        <div className="page-container">
          <div className="mainpage-container">
            <div>
              <div id="staff-header">
                <h1 className="sm-text bold">HariHari Ramen</h1>
                <h1 className="sm-text">Staff</h1>
              </div>

              <hr className="gray-line"></hr>

              <div id="table-clr-section">
                {link &&
                  link.map((element, i) => (
                    <div
                      className={`table-clr section ${
                        selectedTable === i + 1 ? "table-clr-active" : null
                      } ${link[i].call_waiter ? "waiter-active" : null}`}
                      key={i}
                      onClick={() => setCurrentTable(i + 1)}
                    >
                      {link[i].call_waiter ? (
                        <FontAwesomeIcon
                          icon={faBell}
                          className="sm-text bell-fa"
                        />
                      ) : (
                        <span></span>
                      )}
                      <h1 className="sm-text">{link[i].table_id}</h1>
                    </div>
                  ))}
              </div>

              <div id="table-info" className="staff-box">
                <div id="table-info-header">
                  <div>
                    <h1 id="myTableId" className="sm-text bold">
                      Table {selectedTable}
                    </h1>
                    <h1 className="sm-text">Check-in time: 15:45:03</h1>
                  </div>
                  <div>
                    <div>
                      <button
                        className="sm-text red-table-btn"
                        onClick={() => setQR(!qrPopup)}
                      >
                        View QR
                      </button>
                    </div>
                    <div>
                      {link && link[selectedTable - 1].call_waiter ? (
                        <button
                          onClick={() => callWaiterClick()}
                          className="sm-text yellow-table-btn"
                        >
                          Send Waiter
                        </button>
                      ) : (
                        <button className="sm-text gray-table-btn">
                          Send Waiter
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="status-box table-head">
                    <h1 className="sm-text">Order no.</h1>
                    <h1 className="sm-text">Status</h1>
                  </div>
                  <div id="table-info-container">
                    {order &&
                      order.map((x, i) => (
                        <div className="status-box table-list" key={i}>
                          <h1 className="sm-text section">
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className="fa fa-info"
                              onClick={() => orderClick(x.menus, x.custom)}
                            />
                            {x.order_id}
                          </h1>
                          <select
                            onChange={changeStatus}
                            onClick={() => getIndexStatus(x)}
                            value={x.status}
                            className="sm-text"
                          >
                            <option value="ordered">Ordered</option>
                            <option value="received">Received</option>
                            <option value="preparing">Preparing</option>
                            <option value="serving">Serving</option>
                            <option value="served">Served</option>
                            <option value="cancel">Cancel</option>
                          </select>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="staff-box">
              <div id="payment-header">
                <h1 className="sm-text bold">Scan to Checkout</h1>
                <div>
                  <button
                    className="sm-text red-table-btn"
                    onClick={() => setShowCam(!showCam)}
                  >
                    {showCam !== true ? (
                      <span>Show Cam</span>
                    ) : (
                      <span>Close Cam</span>
                    )}
                  </button>
                </div>
              </div>
              <div id="show-cam" className="staff-box ">
                {showCam && (
                  <BarcodeScannerComponent
                    //   width={500}
                    //   height={500}
                    onUpdate={(err, result) => {
                      if (result) checkOut(result.text);
                    }}
                  />
                )}
              </div>
              {/* <p className="sm-text">{data}</p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
