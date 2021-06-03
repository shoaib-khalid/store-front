export interface IAppConfig {
    env: {
        name: string;
    };
    serviceUrl: {
        userServiceURL: string;
        productServiceURL: string;
        payServiceURL: string;
        orderServiceURL: string;
        deliveryServiceURL: string;
    };
}