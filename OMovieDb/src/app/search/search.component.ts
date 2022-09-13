import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: 'searchBar',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class searchComponent{

    @Input() userSearchString = '';
    @Output() newResults = new EventEmitter();

    tooManyResults = false;
    movieNotFound = false;
    searchTerm: string = '';
    pagnationNavigation :any[] = [];
    currentPage : number = 1;
    totalResults :number = 0;
    movieResults :any = [];
    totalPages:number = 1;
    maxNavPages:number = 10;

    constructor(){}

    searchOMDb(){

        this.newResults.emit("databaseJSON")
    }

    setPageNavigation(){
        this.pagnationNavigation = []

        var start = (this.currentPage - 4 <= 1)? 1 : this.currentPage - 4 ;
        var end = (start + 9 >= this.totalPages)? this.totalPages : start + 9;

        for(var begin: number = start ; begin <= end ; begin++ ){
                this.pagnationNavigation.push(begin);
        }
        if(end < this.totalPages ){
            this.pagnationNavigation.push('...')
            this.pagnationNavigation.push(this.totalPages)
        }

    }

    sendToPage($event: any){
        let params: string = '';
        const pageToFind: number = parseInt($event.target.getAttribute('page-num'));
        params += `&s=${this.searchTerm}`
        if(pageToFind != undefined && pageToFind >= 1 && pageToFind <= 100){
            params+= `&page=${pageToFind}`
        }
        this.currentPage = pageToFind;
        this.sendApiRequest(params)
    }

    onSearchBarChange(event?: any, newPage?: number){
        this.searchTerm = event.target.value;
        let params = `&s=${this.searchTerm}`
        this.sendApiRequest(params)
    }

    sendApiRequest(params: string){
        
        /// Too manny results
        if(this.searchTerm.length < 2){
            return
        }

        this.resetSearchError();
        fetch(`http://www.omdbapi.com/?apikey=54bb371f${params}`)
        .then((response) => response.json())
        .then((data) => {
            this.movieResults = data.Search? data.Search: [];
            this.totalResults = data.totalResults? data.totalResults: 0;
            this.totalPages = data.totalResults? Math.floor(data.totalResults/10): 0;
            this.setPageNavigation();
            if(data.Error){
                this.handleError(data.Error);
            }
        })
    }

    handleError(error: string){
        if(error === 'Too many results.') {this.tooManyResults = true}
        else if(error === 'Movie not found!'){this.movieNotFound = true}
    }

    resetSearchError(){
        this.tooManyResults = false
        this.movieNotFound = false
    }

    isANumber(value: any){
        return typeof value === 'number';
    }
}