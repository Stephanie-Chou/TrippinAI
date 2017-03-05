'use strict';
import React from 'react';


var TOILETRIES_IMAGE_PATH = "../../../images/welcomeKit/toiletries/";
var CLEANING_IMAGE_PATH = "../../../images/welcomeKit/cleaning/";
var KITCHEN_IMAGE_PATH = "../../../images/welcomeKit/kitchen/";
var HOUSE_IMAGE_PATH = "../../../images/welcomeKit/house/";

function List(items) {
    this.items = items;
    this.count = function getItemCount() {
        var count = 0;

        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].isSelected) {
                count = count + 1;
            }
        }
        return count;
    }
}

var toiletriesList = new List([
        {
            description: "",
            title: "Diapers",
            image: TOILETRIES_IMAGE_PATH + "diaper-FelipeAlvarado.svg",
            isSelected: true,
            newOnly: true
        },
        {
            description: "",
            title: "Toilet Paper",
            image: TOILETRIES_IMAGE_PATH + "toiletPaper-PatrickTrouve.svg",
            isSelected: false,
            newOnly: true
        },
        {
            description: "",
            title: "Shampoo",
            image: TOILETRIES_IMAGE_PATH + "shampoo-paperclip.svg",
            isSelected: false,
            newOnly: true
        },
        {
            description: "",
            title: "Soap",
            image: TOILETRIES_IMAGE_PATH + "soap-StanislavLevin.svg",
            isSelected: false,
            newOnly: true
        },
        {
            description: "",
            title: "Hand Soap",
            image: TOILETRIES_IMAGE_PATH + "handsoap-JurajSedlak.svg",
            isSelected: false,
            newOnly: true
        },
        {
            description: "1 per person",
            title: "Toothbrush",
            image: TOILETRIES_IMAGE_PATH + "toothbrush-HeaPohLin.svg",
            isSelected: false,
            newOnly: true
        },
        {
            description: "",
            title: "Toothpaste",
            image: TOILETRIES_IMAGE_PATH + "toothpaste-AshleyFiveash.svg",
            isSelected: false,
            newOnly: true
        },
        {
            description: "",
            title: "Lotion",
            image: TOILETRIES_IMAGE_PATH + "lotion-OliviuStoian.svg",
            isSelected: false,
            newOnly: true
        },
        {
            description: "",
            title: "Feminine Hygiene Products",
            image: TOILETRIES_IMAGE_PATH + "feminine-iconsphere.svg",
            isSelected: false,
            newOnly: true
        },
        {
            description: "Bandages, Neosporin, Q-tips",
            title: "First Aid Supplies",
            image: TOILETRIES_IMAGE_PATH + "firstaid-ProSymbols.svg",
            isSelected: false,
            newOnly: true
        }
    ]);

var cleaningList = new List([
    {
        description: "",
        title: "dish soap",
        image: CLEANING_IMAGE_PATH + "dishSoap.svg",
        isSelected: false,
        newOnly: true
    },
    {
        description: "Bathroom and Kitchen",
        title: "Cleansers",
        image: CLEANING_IMAGE_PATH + "LaundryDetergent.svg",
        isSelected: false,
        newOnly: true
    },
    {
        description: "",
        title: "Sponges and Cleaning rags",
        image: CLEANING_IMAGE_PATH + "sponge.svg",
        isSelected: false,
        newOnly: true
    },
    {
        description: "8 pack or more",
        title: "Paper Towels",
        image: CLEANING_IMAGE_PATH + "paperTowels.svg",
        isSelected: false,
        newOnly: true
    },
    {
        description: "",
        title: "Laundry Detergent",
        image: CLEANING_IMAGE_PATH + "laundryDetergent.svg",
        isSelected: false,
        newOnly: true
    },
    {
        description: "Two would be best",
        title: "Waste Baskets",
        image: CLEANING_IMAGE_PATH + "wastebasket.svg",
        isSelected: false,
        newOnly: false
    },
    {
        description: "",
        title: "Mop",
        image: CLEANING_IMAGE_PATH + "sweep.svg",
        isSelected: false,
        newOnly: true
    },
    {
        description: "",
        title: "Broom and Dustpan",
        image: CLEANING_IMAGE_PATH + "sweep.svg",
        isSelected: false,
        newOnly: true
    },
    {
        description: "",
        title: "Trash bags",
        image: CLEANING_IMAGE_PATH + "wastebasket.svg",
        isSelected: false,
        newOnly: true
    },
    {
        description: "",
        title: "Toilet Brush and Plunger",
        image: CLEANING_IMAGE_PATH + "laundryDetergent.svg",
        isSelected: false,
        newOnly: true
    },

]);

var houseList = new List([
    {
        description: "Quantity Needed: 4, 30\" x54\" ",
        title: "Bath Towels",
        image: HOUSE_IMAGE_PATH + "towels_.svg",
        isSelected: false,
        newOnly: true
    },
    {
        description: "",
        title: "Queen Sheets and Comforter",
        image: HOUSE_IMAGE_PATH + "bed_anbileruAdaleru.svg",
        isSelected: false,
        newOnly: true
    },
    {
        description: "Quantity Needed: 2",
        title: "Plush Blankets",
        image: HOUSE_IMAGE_PATH + "towels_.svg",
        isSelected: false,
        newOnly: true
    },
    {
        description: "Quantity Needed: 4",
        title: "Pillows",
        image: HOUSE_IMAGE_PATH + "pillow.svg",
        isSelected: false,
        newOnly: true
    },
    {
        description: "",
        title: "Alarm Clock",
        image: HOUSE_IMAGE_PATH + "alarmclock.svg",
        isSelected: false,
        newOnly: false
    },
    {
        description: "Paper, pens, pencils",
        title: "Writing Utensils",
        image: HOUSE_IMAGE_PATH + "writing.svg",
        isSelected: false,
        newOnly: false
    },
    {
        description: "",
        title: "Lightbulbs",
        image: HOUSE_IMAGE_PATH + "lightbulb.svg",
        isSelected: false,
        newOnly: false
    },
    {
        description: "",
        title: "3-Drawered Storage Bins",
        image: HOUSE_IMAGE_PATH + "drawers_proSymbols.svg",
        isSelected: false,
        newOnly: false
    }
]);

var kitchenList = new List([
    {
        description: "4 of each fork, knife, spoon",
        title: "Tableware",
        image: KITCHEN_IMAGE_PATH + "eating_doubco.svg",
        isSelected: false,
        newOnly: false
    },
    {
        description: "4 of each plate, bowl, cup",
        title: "Dishes",
        image: KITCHEN_IMAGE_PATH + "eating_doubco.svg",
        isSelected: false,
        newOnly: false
    },
    {
        description: "sauce, frying, large cooking (stainless steel)",
        title: "Pots and Pans",
        image: KITCHEN_IMAGE_PATH + "cookingPot.svg",
        isSelected: false,
        newOnly: false
    },
    {
        description: "",
        title: "Baking tray",
        image: KITCHEN_IMAGE_PATH + "eating_doubco.svg",
        isSelected: false,
        newOnly: false
    },
    {
        description: "like a lasagna dish",
        title: "Glass Dishes",
        image: KITCHEN_IMAGE_PATH + "eating_doubco.svg",
        isSelected: false,
        newOnly: false
    },
    {
        description: "",
        title: "Mixing and Serving Bowls",
        image: KITCHEN_IMAGE_PATH + "bowl_xihnStudio.svg",
        isSelected: false,
        newOnly: false
    },
    {
        description: "Ladles, large spoons and forks, spatulas etc",
        title: "Kitchen Utensils",
        image: KITCHEN_IMAGE_PATH + "eating_doubco.svg",
        isSelected: false,
        newOnly: false
    },
    {
        description: "",
        title: "Can Opener",
        image: KITCHEN_IMAGE_PATH + "canOpener.svg",
        isSelected: false,
        newOnly: false
    },
    {
        description: "",
        title: "Knife and Scissors",
        image: KITCHEN_IMAGE_PATH + "knife_myly.svg",
        isSelected: false,
        newOnly: false
    },
    {
        description: "",
        title: "Cutting Board",
        image: KITCHEN_IMAGE_PATH + "cuttingBoard_GregorySujkowski.svg",
        isSelected: false,
        newOnly: false
    }
]);

var fullCount = function() {
    return toiletriesList.count() + cleaningList.count() + houseList.count() + kitchenList.count()
}


export {
    toiletriesList,
    cleaningList,
    houseList,
    kitchenList,
    fullCount
}