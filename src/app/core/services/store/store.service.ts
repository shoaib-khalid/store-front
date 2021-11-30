import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject, throwError } from 'rxjs';
import { switchMap, take, map, tap, catchError } from 'rxjs/operators';
import { Store, StoreRegionCountries, StoreTiming, StorePagination, StoreAssets } from 'src/app/core/services/store/store.types';
import { AppConfig } from 'src/app/app.config';
import { JwtService } from 'src/app/core/services/jwt/jwt.service';
import { takeUntil } from 'rxjs/operators';
import { LogService } from 'src/app/core/services/logging/logging.service';
import { FormControl } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class StoresService
{
    private _store: BehaviorSubject<Store | null> = new BehaviorSubject(null);
    private _stores: BehaviorSubject<Store[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<StorePagination | null> = new BehaviorSubject(null);
    private _storeRegionCountries: ReplaySubject<StoreRegionCountries[]> = new ReplaySubject<StoreRegionCountries[]>(1);
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _currentStores: Store[] = [];
    public storeControl: FormControl = new FormControl();

    protected apiServer = AppConfig.settings.serviceUrl;
    private productServiceURL: string;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _jwt: JwtService,
        private _logging: LogService
    )
    {
        this.productServiceURL = AppConfig.settings.serviceUrl.productServiceURL;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for store
     *
    */
    get store$(): Observable<Store>
    {
        return this._store.asObservable();
    }

    /**
     * Setter for stores
     *
     * @param value
     */
    set store(value: Store)
    {
        // Store the value
        this._store.next(value);
    }

    /**
     * Getter for stores
     *
    */
    get stores$(): Observable<Store[]>
    {
        return this._stores.asObservable();
    }
    
    /**
     * Setter for stores
     *
     * @param value
     */
    set stores(value: Store[])
    {
        // Store the value
        this._stores.next(value);
    }


    /**
     * Getter for store region countries
     *
     */
    get storeRegionCountries$(): Observable<StoreRegionCountries[]>
    {
        return this._storeRegionCountries.asObservable();
    }

    /**
     * Setter for storeId
     */
    set storeId(str: string)
    {
        localStorage.setItem('storeId', str);
    }

    /**
     * Getter for storeId
     */

    get storeId$(): string
    {
        return localStorage.getItem('storeId') ?? '';
    }

    /**
     * Getter for access token
     */
 
    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }    

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<StorePagination>
    {
        return this._pagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in store data
     */
     getStores(id: string = "", page: number = 0, size: number = 10, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = '', category: string = ''): 
        Observable<{ pagination: StorePagination; stores: Store[] }>
    {
        let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                clientId: clientId,
                page: '' + page,
                pageSize: '' + size,
                sortByCol: '' + sort,
                sortingOrder: '' + order.toUpperCase(),
                name: '' + search
            }
        };

        if (category !== "") {
            header.params["verticalCode"] = category;
        }

        // if ada id change url stucture
        if (id !== "") { id = "/" + id } 
        
        return this._httpClient.get<{ pagination: StorePagination; stores: Store[] }>(this.productServiceURL + '/stores' + id, header)
        .pipe(
            tap((response) => {
                
                this._logging.debug("Response from StoresService (Before Reconstruct)",response);

                // Pagination
                let _pagination = {
                    length: response["data"].totalElements,
                    size: response["data"].size,
                    page: response["data"].number,
                    lastPage: response["data"].totalPages,
                    startIndex: response["data"].pageable.offset,
                    endIndex: response["data"].pageable.offset + response["data"].numberOfElements - 1
                }
                this._logging.debug("Response from StoresService (pagination)",_pagination);
                
                // this is local
                this._currentStores = response["data"].content;
                
                (this._currentStores).forEach(async (item, index) => {
                    // let assets = await this.getStoreAssets(item.id);
                    // this._currentStores[index] = Object.assign(this._currentStores[index],{storeLogo: "" });
                    this._currentStores[index] = Object.assign(this._currentStores[index],{slug: item.name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '')});
                    this._currentStores[index] = Object.assign(this._currentStores[index],{duration: 30});
                    this._currentStores[index] = Object.assign(this._currentStores[index],{totalSteps: 3});
                    this._currentStores[index] = Object.assign(this._currentStores[index],{featured: true});
                    this._currentStores[index] = Object.assign(this._currentStores[index],{progress: { completed: 2, currentStep: 2  }});
                    this._currentStores[index] = Object.assign(this._currentStores[index],{category: item.type});
                    this._currentStores[index] = Object.assign(this._currentStores[index],{completed: 2});
                    this._currentStores[index] = Object.assign(this._currentStores[index],{currentStep: 3});
                    // this._currentStores[index]["storeLogo"] = (assets && assets !== null) ? assets["logoUrl"] : "";
                });

                this._logging.debug("Response from StoresService (After Reconstruct)",this._currentStores);

                // this is observable service

                this._pagination.next(_pagination);
                this._stores.next(this._currentStores);
            })
        );
    }

    getStoresById(id: string): Observable<Store>
    {
        return this._stores.pipe(
            take(1),
            map((stores) => {

                // Find the store
                const store = stores.find(item => item.id === id) || null;

                // set this
                this.storeControl.setValue(store);

                this._logging.debug("Response from StoresService (getStoresById)",store);

                // Update the store
                this._store.next(store);

                // Return the store
                return store;
            }),
            switchMap((store) => {

                if ( !store )
                {
                    return throwError('Could not found store with id of ' + id + '!');
                }

                return of(store);
            })
        );
    }

    post(storeBody: Store): Observable<any>
    {
        let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                "clientId": clientId
            }
        };
        
        return this.store$.pipe(
            take(1),
            // switchMap(products => this._httpClient.post<InventoryProduct>('api/apps/ecommerce/inventory/product', {}).pipe(
            switchMap(stores => this._httpClient.post<Store>(this.productServiceURL + '/stores', storeBody , header).pipe(
                map((response) => {

                    this._logging.debug("Response from StoresService (Create Store)",response);

                    // Return the new product
                    return response;
                })
            ))
        );
    }

    /**
     * Update the store
     *
     * @param store
     */
    update(storeId: string, storeBody: Store): Observable<any>
    {
        let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                "clientId": clientId
            }
        };
        
        return this.store$.pipe(
            take(1),
            // switchMap(products => this._httpClient.post<InventoryProduct>('api/apps/ecommerce/inventory/product', {}).pipe(
            switchMap(stores => this._httpClient.put<Store>(this.productServiceURL + '/stores/' + storeId , storeBody , header).pipe(
                map((response) => {

                    this._logging.debug("Response from StoresService (Edit Store)",response);

                    // Return the new product
                    return response;
                })
            ))
        );
    }

    /**
     * Delete the store
     * 
     * @param storeId
     */

    delete(storeId: string): Observable<any>
    {
        let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                "clientId": clientId
            }
        };
        
        return this.stores$.pipe(
            take(1),
            switchMap(stores => this._httpClient.delete(this.productServiceURL +'/stores/' + storeId, header).pipe(
                map((response) => {

                    this._logging.debug("Response from StoresService (Delete Store)",response);

                    // Find the index of the deleted product
                    const index = stores.findIndex(item => item.id === storeId);

                    // Delete the product
                    stores.splice(index, 1);

                    // Update the products
                    this._stores.next(stores);

                    let isDeleted:boolean = false;
                    if (response["status"] === 200) {
                        isDeleted = true
                    }

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    setFirstStoreId(){
        this.stores$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((storeList: Store[]) => {
                this.storeId = storeList[0].id;
            });  
    }

    getStoreRegionCountries(): Observable<any>
    {
        let accessToken = this._jwt.getJwtPayload(this.accessToken).act;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        return this._httpClient.get<any>(this.productServiceURL + '/region-countries', header)
            .pipe(
                tap((response) => {
                    this._logging.debug("Response from StoresService (getStoreRegionCountries)",response);
                    return this._storeRegionCountries.next(response["data"].content);
                })
            );
    }

    getStoreRegionCountryState(regionCountryId: string): Observable<any>
    {
        let accessToken = this._jwt.getJwtPayload(this.accessToken).act;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                "regionCountryId": regionCountryId
            }
        };

        return this._httpClient.get<any>(this.productServiceURL + '/region-country-state', header);
    }

    postTiming(storeId: string, storeTiming: StoreTiming): Observable<any>
    {
        let accessToken = this._jwt.getJwtPayload(this.accessToken).act;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        return this._httpClient.post<any>(this.productServiceURL + '/stores/' + storeId + '/timings', storeTiming , header ).pipe(
            map((response) => {
                this._stores.next(response);
            })
        );
    }

    async getStoreAssets(storeId: string)
    {
        let accessToken = this._jwt.getJwtPayload(this.accessToken).act;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        let response = await this._httpClient.get<any>(this.productServiceURL + '/stores/' + storeId + '/assets', header).toPromise();

        let index = this._currentStores.findIndex(item => item.id === storeId);

        let storeName: string = (index < 0) ? "undefined" : this._currentStores[index].name;

        this._logging.debug("Response from StoresService (getStoreAssets) (store: " + storeName + ")",response);
        return response.data;
    }

    postAssets(storeId: string, storeAssets): Observable<any>
    {
        let accessToken = this._jwt.getJwtPayload(this.accessToken).act;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        return this._httpClient.post<any>(this.productServiceURL + '/stores/' + storeId + '/assets', storeAssets , header ).pipe(
            map((response) => {
                this._stores.next(response);
            })
        );
    }

    deleteAssetsBanner(storeId: string): Observable<any>
    {
        let accessToken = this._jwt.getJwtPayload(this.accessToken).act;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        return this._httpClient.delete<any>(this.productServiceURL + '/stores/' + storeId + '/assets/banner' , header ).pipe(
            map((response) => {
                this._logging.debug("Response from StoresService (deleteAssetsBanner)",response);
            })
        );
    }

    deleteAssetsLogo(storeId: string): Observable<any>
    {
        let accessToken = this._jwt.getJwtPayload(this.accessToken).act;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        return this._httpClient.delete<any>(this.productServiceURL + '/stores/' + storeId + '/assets/logo' , header ).pipe(
            map((response) => {
                this._logging.debug("Response from StoresService (deleteAssetsLogo)",response);
            })
        );
    }
    
    async getExistingName(name:string){
        let accessToken = this._jwt.getJwtPayload(this.accessToken).act;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params:{
                storeName: name
            }
        };

        let response = await this._httpClient.get<any>(this.productServiceURL + '/stores/checkname', header)
                            .pipe<any>(catchError((error:HttpErrorResponse)=>{
                                    return of(error);
                                })
                            )
                            .toPromise();
    

        this._logging.debug("Response from StoresService (getExistingName) ",response);
        
        //if exist status = 409, if not exist status = 200
        return response.status;

    }

    async getExistingURL(url: string){
        let accessToken = this._jwt.getJwtPayload(this.accessToken).act;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                domain: url
            }
        };

        let response = await this._httpClient.get<any>(this.productServiceURL + '/stores/checkdomain', header)
                                .pipe(catchError((err: HttpErrorResponse) => {
                                    return of(err);
                                }))
                                .toPromise();

        this._logging.debug("Response from StoresService (getExistingURL)",response);

        // if exists status = 409, if not exists status = 200
        return response.status;
    }
}
