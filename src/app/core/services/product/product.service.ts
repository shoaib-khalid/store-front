import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Product, ProductVariant, ProductInventory, ProductCategory, ProductPagination, ProductVariantAvailable, ProductPackageOption } from 'src/app/core/services/product/product.types';
import { AppConfig } from 'src/app/app.config';
import { JwtService } from 'src/app/core/services/jwt/jwt.service';
import { LogService } from 'src/app/core/services/logging/logging.service';

@Injectable({
    providedIn: 'root'
})
export class ProductService
{
    // Private
    private _product: BehaviorSubject<Product | null> = new BehaviorSubject(null);
    private _products: BehaviorSubject<Product[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<ProductPagination | null> = new BehaviorSubject(null);

    private _variant: BehaviorSubject<ProductVariant | null> = new BehaviorSubject(null);
    private _variants: BehaviorSubject<ProductVariant[] | null> = new BehaviorSubject(null);

    private _category: BehaviorSubject<ProductCategory | null> = new BehaviorSubject(null);
    private _categories: BehaviorSubject<ProductCategory[] | null> = new BehaviorSubject(null);

    private _inventory: BehaviorSubject<ProductInventory | null> = new BehaviorSubject(null);
    private _inventories: BehaviorSubject<ProductInventory[] | null> = new BehaviorSubject(null);

    private _package: BehaviorSubject<ProductPackageOption | null> = new BehaviorSubject(null);
    private _packages: BehaviorSubject<ProductPackageOption[] | null> = new BehaviorSubject(null);

    protected apiServer = AppConfig.settings.serviceUrl;
    private productServiceURL: string;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _apiServer: AppConfig,
        private _logging: LogService,
        private _jwt: JwtService,
    )
    {
        this.productServiceURL = AppConfig.settings.serviceUrl.productServiceURL;
        this.productServiceURL = this.productServiceURL.slice(0, -1);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for product
     */
    get product$(): Observable<Product>
    {
        return this._product.asObservable();
    }

    /**
     * Getter for products
     */
    get products$(): Observable<Product[]>
    {
        return this._products.asObservable();
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<ProductPagination>
    {
        return this._pagination.asObservable();
    }

    /**
     * Getter for categories
     */
    get categories$(): Observable<ProductCategory[]>
    {
        return this._categories.asObservable();
    }

    /**
     * Getter for categories
     */
     get packages$(): Observable<ProductPackageOption[]>
     {
         return this._packages.asObservable();
     }

    /**
     * Getter for access token
     */
 
     get accessToken(): string
     {
         return localStorage.getItem('accessToken') ?? '';
     }

    /**
     * Getter for storeId
     */
 
     get storeId$(): string
     {
         return localStorage.getItem('store_id') ?? '';
     }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get products
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */
    getProducts(page: number = 0, size: number = 20, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = '', status: string = 'ACTIVE,INACTIVE'):
        Observable<{ pagination: ProductPagination; products: Product[] }>
    {
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                page: '' + page,
                pageSize: '' + size,
                sortByCol: '' + sort,
                sortingOrder: '' + order.toUpperCase(),
                name: '' + search,
                status: '' + status
            }
        };

        return this._httpClient.get<any>(this.productServiceURL +'/stores/'+this.storeId$+'/products', header).pipe(
            tap((response) => {

                this._logging.debug("Response from ProductsService",response);

                let _pagination = {
                    length: response.data.totalElements,
                    size: response.data.size,
                    page: response.data.number,
                    lastPage: response.data.totalPages,
                    startIndex: response.data.pageable.offset,
                    endIndex: response.data.pageable.offset + response.data.numberOfElements - 1
                }
                this._pagination.next(_pagination);
                this._products.next(response.data.content);
            })
        );
    }

    /**
     * Get product by id
     */
    getProductById(id: string): Observable<Product>
    {
        return this._products.pipe(
            take(1),
            map((products) => {

                // Find the product
                const product = products.find(item => item.id === id) || null;

                this._logging.debug("Response from ProductsService (Current Product)",product);

                // Update the product
                this._product.next(product);

                // Return the product
                return product;
            }),
            switchMap((product) => {

                if ( !product )
                {
                    return throwError('Could not found product with id of ' + id + '!');
                }

                return of(product);
            })
        );
    }

    /**
     * Create product
     */
    createProduct(categoryId: string, productType: string): Observable<Product>
    {
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        //let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        const now = new Date();
        const date = now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes()  + ":" + now.getSeconds();
        const productName = "A New Product " + date;
        const seoName = productName.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '');

        const body = {
            "categoryId": categoryId,
            "name": productName,
            "status": "INACTIVE",
            "description": "Tell us more about your product",
            "storeId": this.storeId$,
            "allowOutOfStockPurchases": false,
            "trackQuantity": false,
            "seoName":seoName,
            "seoUrl": "https://cinema-online.symplified.ai/product/name/"+ seoName,
            "minQuantityForAlarm": -1,
            "packingSize": "S",
            "isPackage": (productType === "combo") ? true : false
        };

        return this.products$.pipe(
            take(1),
            // switchMap(products => this._httpClient.post<InventoryProduct>('api/apps/ecommerce/inventory/product', {}).pipe(
            switchMap(products => this._httpClient.post<Product>(this.productServiceURL + '/stores/' + this.storeId$ + '/products', body , header).pipe(
                map((newProduct) => {

                    // Update the products with the new product
                    this._products.next([newProduct["data"], ...products]);

                    // Return the new product
                    return newProduct;
                })
            ))
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param product
     */
    updateProduct(id: string, product: Product): Observable<Product>
    {
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        //let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        return this.products$.pipe(
            take(1),
            // switchMap(products => this._httpClient.post<InventoryProduct>('api/apps/ecommerce/inventory/product', {}).pipe(
            switchMap(products => this._httpClient.put<Product>(this.productServiceURL + '/stores/' + this.storeId$ + '/products/' + id, product , header).pipe(
                map((updatedProduct) => {

                    console.log("products: ",products);
                    console.log("updatedProduct: ",updatedProduct);

                    // Find the index of the updated product
                    const index = products.findIndex(item => item.id === id);

                    // Update the product
                    products[index] = { ...products[index], ...updatedProduct["data"]};

                    console.log("products[index]", products[index])

                    // Update the products
                    this._products.next(products);

                    // Return the updated product
                    return updatedProduct["data"];
                }),
                switchMap(updatedProduct => this.product$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the product if it's selected
                        this._product.next(updatedProduct["data"]);

                        // Return the updated product
                        return updatedProduct["data"];
                    })
                ))
            ))
        );
    }

    /**
     * Delete the product
     *
     * @param id
     */
    deleteProduct(id: string): Observable<boolean>
    {
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        //let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };
      
        return this.products$.pipe(
            take(1),
            switchMap(products => this._httpClient.delete(this.productServiceURL +'/stores/'+this.storeId$+'/products/'+id, header).pipe(
                map((status: number) => {

                    // Find the index of the deleted product
                    const index = products.findIndex(item => item.id === id);

                    // Delete the product
                    products.splice(index, 1);

                    // Update the products
                    this._products.next(products);

                    let isDeleted:boolean = false;
                    if (status === 200) {
                        isDeleted = true
                    }

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Get product assets by id
     */

    async getProductAssetsById(productId){
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        //let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        let response = await this._httpClient.get<any>(this.productServiceURL + '/stores/' + this.storeId$ + '/products/' + productId + '/assets').toPromise();

        this._logging.debug("Response from ProductsService (getProductAssetsById)",response);

        return response.data;
    }

    /**
     * Add Inventory to the product
     *
     * @param product
     */
    addInventoryToProduct(product: Product): Observable<ProductInventory>{

        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        //let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        const now = new Date();
        const date = now.getFullYear() + "" + (now.getMonth()+1) + "" + now.getDate() + "" + now.getHours() + "" + now.getMinutes()  + "" + now.getSeconds();

        const body = {
            "productId": product.id,
            "itemCode": product.id + date,
            "price": 0,
            "compareAtprice": 0,
            "quantity": 1,
            "sku": null,
            "status": "AVAILABLE"
        };

        // return of();

        return this._inventories.pipe(
            take(1),
            // switchMap(products => this._httpClient.post<InventoryProduct>('api/apps/ecommerce/inventory/product', {}).pipe(
            switchMap(products => this._httpClient.post<Product>(this.productServiceURL +'/stores/'+this.storeId$+'/products/' + product.id + "/inventory", body , header).pipe(
                map((newProduct) => {

                    console.log("newProduct InventoryItem",newProduct);
                    // Update the products with the new product
                    // this._products.next([newProduct["data"], ...products]);

                    // Return the new product
                    return newProduct["data"];
                })
            ))
        );
    }

    /**
     * Update Inventory to the product
     *
     * @param product
     */
    updateInventoryToProduct(productInventoriesId,productInventories: ProductInventory): Observable<ProductInventory>{

        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        //let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        const now = new Date();
        const date = now.getFullYear() + "" + (now.getMonth()+1) + "" + now.getDate() + "" + now.getHours() + "" + now.getMinutes()  + "" + now.getSeconds();

        const body = {
            "productId": 'productInventories.id',
            "itemCode": 'productInventories.id + date',
            "price": 0,
            "compareAtprice": 0,
            "quantity": 1,
            "sku": null,
            "status": "AVAILABLE"
        };

        // return of();

        return this._inventories.pipe(
            take(1),
            // switchMap(products => this._httpClient.post<InventoryProduct>('api/apps/ecommerce/inventory/product', {}).pipe(
            switchMap(products => this._httpClient.post<Product>(this.productServiceURL +'/stores/'+this.storeId$+'/products/' + 'product.id' + "/inventory", body , header).pipe(
                map((newProduct) => {

                    console.log("newProduct InventoryItem",newProduct)
                    // Update the products with the new product
                    // this._products.next([newProduct["data"], ...products]);

                    // Return the new product
                    return newProduct["data"];
                })
            ))
        );
    }


    getVariants(){
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        return this._httpClient.get<any>(this.productServiceURL +'/stores/'+this.storeId$+'/products', header).pipe(
            tap((response) => {
                let _pagination = {
                    length: response.data.totalElements,
                    size: response.data.size,
                    page: response.data.number,
                    lastPage: response.data.totalPages,
                    startIndex: response.data.pageable.offset,
                    endIndex: response.data.pageable.offset + response.data.numberOfElements - 1
                }
                // this._pagination.next(_pagination);
                
                let _newProducts: Array<any> = [];
                let _newVariants: Array<any> = [];
                let _newVariantTags: Array<any> = [];
                (response.data.content).forEach(object => {
                    _newProducts.push({
                        id: object.id,
                        thumbnail: object.thumbnailUrl,
                        images: Object.keys(object.productAssets).map(function(key){return object.productAssets[key].url}),
                        status: object.status,
                        name: object.name,
                        description: object.description,
                        productInventories: object.productInventories,
                        stock: object.productInventories[0].quantity, // need looping
                        allowOutOfStockPurchases: object.allowOutOfStockPurchases,
                        minQuantityForAlarm: object.minQuantityForAlarm,
                        trackQuantity: object.trackQuantity,
                        sku: object.productInventories[0].sku, // need looping
                        price: object.productInventories[0].price, // need looping
                        weight: 0,
                        categoryId: object.categoryId,
                        variants: object.productVariants
                    });
                    _newVariants.push(object.productVariants)
                    _newVariantTags.push({
                        id: Object.keys(object.productVariants).map(function(key){return object.productVariants[key].id}),
                        value: Object.keys(object.productVariants).map(function(key){return object.productVariants[key].value}),
                        productId: Object.keys(object.productVariants).map(function(key){return object.productVariants[key].productId}),
                    });
                });
                // this._products.next(_newProducts);
                // this._variants.next(_newVariants);
            })
        );
    }

    /**
     * Create Product Variant
     * 
     * @param variant
     * @param productId
     */
    createVariant(variant: ProductVariant, productId: string){
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        //let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        const now = new Date();
        const date = now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes()  + ":" + now.getSeconds();

        return this.products$.pipe(
            take(1),
            // switchMap(products => this._httpClient.post<InventoryProduct>('api/apps/ecommerce/inventory/product', {}).pipe(
            switchMap(products => this._httpClient.post<ProductVariant>(this.productServiceURL + '/stores/' + this.storeId$ + '/products/' + productId + "/variants", variant , header).pipe(
                map((newProduct) => {

                    this._logging.debug("Response from ProductsService (Current Variant)",newProduct);

                    // Return the new product
                    return newProduct["data"];
                })
            ))
        );
    }

    /**
     * Update Product Variant
     */

    updateVariant(id: string, variant: ProductVariant): Observable<ProductCategory>
    {
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        let queryParam = "?storeId=" + this.storeId$ + "&name=" + variant.name;

        // product-service/v1/swagger-ui.html#/store-category-controller/putStoreProductAssetsByIdUsingPUT
        return this._httpClient.put<any>(this.productServiceURL + '/store-categories/' + id + queryParam, header);
    }

    /**
     * Update Product Variant
     */
    deleteVariant(variant: ProductVariant, productId:string){
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        //let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };
      
        return this.products$.pipe(
            take(1),
            switchMap(products => this._httpClient.delete(this.productServiceURL + '/stores/' + this.storeId$ + '/products/' + productId + '/variants/' + variant.id, header).pipe(
                map(() => {
                    // Return the deleted variant
                    return variant;
                })
            ))
        );
    }

    /**
     * Create Product Variant
     * 
     * @param variantAvailable
     * @param productId
     */
    createVariantAvailable(variantAvailable: ProductVariantAvailable, productId: string){
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        //let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        const now = new Date();
        const date = now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes()  + ":" + now.getSeconds();

        return this.products$.pipe(
            take(1),
            // switchMap(products => this._httpClient.post<InventoryProduct>('api/apps/ecommerce/inventory/product', {}).pipe(
            switchMap(products => this._httpClient.post<ProductVariantAvailable>(this.productServiceURL + '/stores/' + this.storeId$ + '/products/' + productId + "/variants-available", variantAvailable , header).pipe(
                map((newProduct) => {

                    this._logging.debug("Response from ProductsService (Current Variant Available)",newProduct);

                    // Return the new product
                    return newProduct["data"];
                })
            ))
        );
    }

    updateVariantAvailable(id: string, variant: ProductVariant): Observable<ProductCategory>
    {
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        let queryParam = "?storeId=" + this.storeId$ + "&name=" + variant.name;

        // product-service/v1/swagger-ui.html#/store-category-controller/putStoreProductAssetsByIdUsingPUT
        return this._httpClient.put<any>(this.productServiceURL + '/store-categories/' + id + queryParam, header);
    }

    /**
     * Update Product Variant
     */
    deleteVariantAvailable(variantAvailable: ProductVariantAvailable, productId:string){
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        //let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };
      
        return this.products$.pipe(
            take(1),
            switchMap(products => this._httpClient.delete(this.productServiceURL + '/stores/' + this.storeId$ + '/products/' + productId + '/variants-available/' + variantAvailable.id, header).pipe(
                map(() => {
                    // Return the deleted variant
                    return variantAvailable;
                })
            ))
        );
    }

    /**
     * Get categories
     * 
     * @param name
     */
    getCategories(name: string = null): Observable<ProductCategory[]>
    {

        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                name
            }
        };

        // product-service/v1/swagger-ui.html#/store-controller/putStoreCategoryByStoreIdUsingGET
        return this._httpClient.get<any>(this.productServiceURL + '/stores/' + this.storeId$ + '/store-categories',header).pipe(
            tap((categories) => {
                this._logging.debug("Response from ProductsService (getCategories)",categories);
                this._categories.next(categories.data);
            })
        );
    }
 
     /**
      * Create category
      *
      * @param category
      */
    createCategory(category: ProductCategory, body = {}): Observable<ProductCategory>
    {
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                name: category.name,
                storeId: this.storeId$
            }
        };

        // product-service/v1/swagger-ui.html#/store-category-controller/postStoreCategoryByStoreIdUsingPOST
        return this.categories$.pipe(
            take(1),
            switchMap(categories => this._httpClient.post<any>(this.productServiceURL + '/store-categories', body , header).pipe(
                map((newCategory) => {
                    // Update the categories with the new category
                    this._categories.next([...categories, newCategory.data]);

                    // Return new category from observable
                    return newCategory;
                })
            ))
        );
    }
  
     /**
      * Update the category
      *
      * @param id
      * @param category
      */
    updateCategory(id: string, category: ProductCategory): Observable<ProductCategory>
    {

        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        let queryParam = "?storeId=" + this.storeId$ + "&name=" + category.name;

        // product-service/v1/swagger-ui.html#/store-category-controller/putStoreProductAssetsByIdUsingPUT
        return this._httpClient.put<any>(this.productServiceURL + '/store-categories/' + id + queryParam, header);
    }
  
     /**
      * Delete the category
      *
      * @param id
      */
    deleteCategory(id: string): Observable<boolean>
    {
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        // product-service/v1/swagger-ui.html#/store-category-controller
        return this._categories.pipe(
            take(1),
            switchMap(categories => this._httpClient.delete(this.productServiceURL + '/store-categories/' + id ,header)
            .pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted category
                    const index = categories.findIndex(item => item.id === id);

                    // Delete the category
                    categories.splice(index, 1);

                    // Update the categories
                    this._categories.next(categories);

                    // Return the deleted status
                    return isDeleted;
                }),
                filter(isDeleted => isDeleted),
                switchMap(isDeleted => this.products$.pipe(
                    take(1),
                    map((products) => {

                        // Iterate through the products
                        products.forEach((product) => {

                            // remove that category in each products 
                            product.categoryId = "";

                        });

                        // Return the deleted status
                        return isDeleted;
                    })
                ))
            ))
        );
    }

    /**
     * Get Product Package Options
     * 
     * @param name
     */
    getProductPackageOptions(packageId: string): Observable<ProductPackageOption[]>
    {

        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this._httpClient.get<any>(this.productServiceURL + '/stores/' + this.storeId$ + '/package/' + packageId + '/options',header).pipe(
            tap((packages) => {
                this._logging.debug("Response from ProductsService (getProductPackageOptions)",packages);
                this._packages.next(packages.data);
            })
        );
    }

    /**
     * Add Inventory to the product
     *
     * @param product
     */
    addOptionsToProductPackage(packageId, body: ProductPackageOption): Observable<ProductInventory>{

        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        //let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        const now = new Date();
        const date = now.getFullYear() + "" + (now.getMonth()+1) + "" + now.getDate() + "" + now.getHours() + "" + now.getMinutes()  + "" + now.getSeconds();

        // return of();

        return this._inventories.pipe(
            take(1),
            // switchMap(products => this._httpClient.post<InventoryProduct>('api/apps/ecommerce/inventory/product', {}).pipe(
            switchMap(products => this._httpClient.post<Product>(this.productServiceURL +'/stores/'+this.storeId$+'/products/' + packageId + "/inventory", body , header).pipe(
                map((newProduct) => {

                    console.log("newProduct InventoryItem",newProduct);
                    // Update the products with the new product
                    // this._products.next([newProduct["data"], ...products]);

                    // Return the new product
                    return newProduct["data"];
                })
            ))
        );
    }

    createProductsOptionById(packageId, productPackage) {

        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        // product-service/v1/swagger-ui.html#/store-category-controller/postStoreCategoryByStoreIdUsingPOST
        return this.packages$.pipe(
            take(1),
            switchMap(packages => this._httpClient.post<any>(this.productServiceURL + '/stores/' + this.storeId$ + '/package/' + packageId + '/options', productPackage , header).pipe(
                map((newpackage) => {
                    // Update the categories with the new category
                    this._packages.next([...packages, newpackage.data]);

                    // Return new category from observable
                    return newpackage.data;
                })
            ))
        );
    }

    getProductsOptionById(optionId: string): Observable<ProductPackageOption>
    {
        return this._packages.pipe(
            take(1),
            map((packages) => {

                // Find the product
                const _package = packages.find(item => item.id === optionId) || null;

                this._logging.debug("Response from ProductsService (getProductsOptionById)",_package);

                // Update the product
                this._package.next(_package);

                // Return the product
                return _package;
            }),
            switchMap((_package) => {

                if ( !_package )
                {
                    return throwError('Could not found optionId with id of ' + optionId + '!');
                }

                return of(_package);
            })
        );
    }

    updateProductsOptionById(packageId: string, productPackage, optionId: string) {

        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        // product-service/v1/swagger-ui.html#/store-category-controller/postStoreCategoryByStoreIdUsingPOST
        return this._httpClient.put<any>(this.productServiceURL + '/stores/' + this.storeId$ + '/package/' + packageId + '/options/' + optionId, productPackage , header);
    }

    deleteProductsOptionById(optionId: string, packageId: string): Observable<boolean>
    {
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        return this.packages$.pipe(
            take(1),
            switchMap(packages => this._httpClient.delete<any>(this.productServiceURL + '/stores/' + this.storeId$ + '/package/' + packageId + '/options/' + optionId, header).pipe(
                map((response) => {
                    
                    // Find the index of the deleted product
                    const index = packages.findIndex(item => item.id === optionId);

                    // Delete the product
                    packages.splice(index, 1);

                    // Return the deleted status
                    return response.status;
                })
            ))
        );
    }

}
