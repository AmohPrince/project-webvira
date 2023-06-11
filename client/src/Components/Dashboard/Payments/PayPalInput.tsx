import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import React, { useContext } from "react";
import { DEFAULT_PRICE } from "../../../Hooks/useGlobalData";
import { globalData } from "../../../Pages/Dashboard/DashBoard";

const PayPalInput = () => {
  const { showNotification } = useContext(globalData);

  const createOrder = async (): Promise<string> => {
    try {
      const response = await fetch("http://localhost:8080/create-order", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          price: DEFAULT_PRICE.basic,
        }),
      });
      const orderId = await response.text();
      return orderId;
    } catch (err) {
      console.error(err);
      throw new Error("error");
    }
  };

  return (
    <PayPalScriptProvider
      options={{
        "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID!,
        components: "buttons",
        intent: "capture",
        vault: true,
      }}
    >
      <div>
        <p className="mt-2 text-sm font-semibold">Paypal</p>
        <p className="text-xs text-gray-500">
          You can pay with your paypal account but no worries if you dont have a
          paypal account! You can pay with your credit card by clicking on the
          Debit or Credit Card option.You can pay regardless of whether or not
          you have a paypal account!
        </p>
        <PayPalButtons
          className="mt-6 playfair mx-auto"
          onApprove={(data: any, actions): Promise<void> => {
            console.log(data, "onApproveData");
            // actions.restart();
            // capture is for capturing for later withdrawal.
            // actions.order
            //   ?.capture()
            //   .then((captured) => console.log(captured, "Captured"));
            actions.order?.get().then((get) => {
              console.log(get, "get");
              //add paypal to user database
              if (get.status === "APPROVED") {
                showNotification(
                  "Payment was successful, somebody is now working on your website!",
                  "success"
                );
              }
            });
            return Promise.resolve();
          }}
          createOrder={createOrder}
          onError={(err: Record<string, unknown>) => {
            console.log(err, "onErrorError");
            showNotification("An error might have occurred :-(", "error");
          }}
          onCancel={(err: Record<string, unknown>) => {
            console.log(err, "onCancelError");
            showNotification("You cancelled the paypal transaction", "error");
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalInput;
