import axios from 'axios';
import { key , proxy } from '../config';

export default class Search{
    constructor(query){
        this.query = query;
    }

    async getResults(){
        try {
            // const key = '2f8470605e833526178fb4f3370ae025';
            // const proxy = 'https://cors-anywhere.herokuapp.com/';
            const res = await axios(`${proxy}https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            this.result = res.data.recipes;
            // console.log(this.result);
        } catch (error) {
            console.log('error getting results');
            
        }    
    }
}



