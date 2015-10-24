(function(){

    var currencyObj, 
        organizationsArr, 
        hrivniaBut,
        currencyBut,
        tabs,
        radioAverage,
        radioBank,
        mainInput, 
        inputAmount,
        chosenCurrency = "usd", //defaul currency
        currencyType,
        resultBody,
        activeTab = "usd",
        averageAsk, //average ask object
        averageBid, //average bid object   
        askResult = { // currencies sales result
            eur : 0,
            rub : 0,
            usd : 0              
        },
        bidResult = { // hrivnia sales result
            eur : 0,      
            rub : 0,
            usd : 0             
        }, anim,
        banksToShow = ["А-Банк", "Альфа-Банк", "Кредобанк", "Альянс", "Львов Банк", "ОТП Банк", "Ощадбанк", 
                        "ПЛАТИНУМ БАНК (Platinum Bank TM)", "ПУМБ", "ПриватБанк", "Райффайзен Банк Аваль", 
                        "Укрсоцбанк UniCredit Bank TM"],
        filteredBanks = {},
        pageLinks,
        pageWrap, // contact form wrapper
        closePage,
        bankName, // selected bank 
        dropDownMenu, // select element, options - banks
        changeStatus = true; // option - sell or buy, true if want to sell hrivnia, false if want to buy hrivnia
    
        
    addEvent(window, "load", onLoad); 
    
    //indexOf polyfill
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(obj, start) {
             for (var i = (start || 0), j = this.length; i < j; i++) {
                 if (this[i] === obj) { return i; }
             }
             return -1;
        };
    }

    /* function gets json  */
    $jsonp = (function(){
        var that = {};

        that.send = function(src, options) {
        var options = options || {},
          callback_name = options.callbackName || 'callback',
          on_success = options.onSuccess || function(){};

        window[callback_name] = function(data){
          on_success(data);
        };

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = src;

        document.getElementsByTagName('head')[0].appendChild(script);
        };

        return that;
    })();

     /* getting json object from finance.ua server */
    $jsonp.send('http://json2jsonp.com/?url=http://resources.finance.ua/ru/public/currency-cash.json&callback=callbackFunc',
        {onSuccess : onSuccess, callbackName : "callbackFunc"}); 


    /* onload function */
    function onLoad(event) {
        hrivniaBut = document.getElementById('toGrivna');
        currencyBut = document.getElementById('toCurrency');
        tabs = document.getElementById('curTabs');
        mainInput = document.getElementById('amount-input');
        resultBody = document.getElementById('resultBody'); //result body with calculated results
        currencyType = document.getElementById('currencyType');
        dropDownMenu = document.getElementById('banksMenu');
        radioAverage = document.getElementById('averageCourse');
        radioBank = document.getElementById('bank');
        pageLinks = document.querySelectorAll('.page-link');
        closePage = document.getElementById('page-close');

        /* initializing */
        addEvent(hrivniaBut, 'click', onCurrencyChoose);
        addEvent(currencyBut, 'click', onCurrencyChoose);
        addEvent(tabs, 'click', onTabsClick);
        addEvent(mainInput, 'keypress', onInputChange);
        addEvent(mainInput, 'keyup', onInputEndKey);
        addEvent(dropDownMenu, 'change', onSelectBankChange);
        addEvent(radioAverage, 'click', onRadioClick);
        addEvent(radioBank, 'click', onRadioClick);
        eventForClass(pageLinks, 'click', onPageLinkClick);
        addEvent(closePage, 'click', onPageClose);

    }

    
    
    /*---------------------------- json object treatment -------------------------------*/
    
    /* json success function */
    function onSuccess(data){
       currencyObj = data;
       organizationsArr = data.organizations;
       oschadB = organizationsArr[9];
       //console.log(data);
       oschadCurrencies = oschadB.currencies;
       getBanks();
       banksListGen();
       getAverageCourse(); // average courses
    }


    /* function gets banks in accordance to showBanks array */
    function getBanks(){
        var bankTitles = [],
            organizationIndex = [];
        for(var i=0; i<organizationsArr.length; i++){
            bankTitles.push(organizationsArr[i].title);   
        }        
       
        for(var k=0; k<banksToShow.length; k++){
            organizationIndex.push(bankTitles.indexOf(banksToShow[k]));
        } 
       
        // assign to filteredBanks object banks by index
        for(var j=0; j<organizationIndex.length; j++){
            if(organizationsArr[organizationIndex[j]] !== undefined){
                filteredBanks[banksToShow[j]] = organizationsArr[organizationIndex[j]];
            }
        }
        
    }
    

    /* function generates options elements */
    function banksListGen(){
        dropDownMenu = document.getElementById('banksMenu');
        for(var prop in filteredBanks){
            var option = document.createElement('option');
            option.value = prop;
            option.innerHTML = prop;
            dropDownMenu.appendChild(option);
        }

    }
    

    //function counts average currency course of all banks
    function getAverageCourse(){
        var eurCount = 0;
        var rubCount = 0;
        var usdCount = 0;
        averageAsk = { // currencies average sales course reset
            eur : 0,
            rub : 0,
            usd : 0              
        };
        averageBid = { // hrivnia average sales course reset
            eur : 0,      
            rub : 0,
            usd : 0             
        }; 
        for(var prop in filteredBanks){
            var bankCurrencies = filteredBanks[prop].currencies;
            for(var y in averageAsk){                            
                if(bankCurrencies[y.toUpperCase()] === undefined ) continue; //if row doesn`t exists then continue to another row
                averageAsk[y] += bankCurrencies[y.toUpperCase()].ask/1; //ask sum
                averageBid[y] += bankCurrencies[y.toUpperCase()].bid/1; //bid sum
                switch(y){
                    case 'eur':
                        eurCount++;
                        break;
                    case 'rub':
                        rubCount++;
                        break;
                    case 'usd':
                        usdCount++;
                        break;
                }
            }
        }

        averageAsk.eur = (averageAsk.eur/eurCount).toFixed(2);
        averageAsk.rub = (averageAsk.rub/rubCount).toFixed(2);
        averageAsk.usd = (averageAsk.usd/usdCount).toFixed(2);
        averageBid.eur = (averageBid.eur/eurCount).toFixed(2);
        averageBid.rub = (averageBid.rub/rubCount).toFixed(2);
        averageBid.usd = (averageBid.usd/usdCount).toFixed(2);
    }

    /*--------------------------- end of json object treatment --------------------------------*/ 
   
    
    /* acts when clicking on page links */
    function onPageLinkClick(e){
        var contactForm = document.forms.contactForm;
        var target = e.target || e.srcElement;
        var infoLink = document.getElementById('info-link');
        var infoPage = document.getElementById('infoPage');
        var pageCaption = document.getElementById('pageCaption');
        var overlaysArr = document.querySelectorAll('.overlay');
        pageWrap = document.getElementById('pageWrapper');
        preventEv(e);
        if(target == infoLink){

            if(hasClass(pageWrap, 'active-page') && (infoPage.style.display == 'block')){
                pageWrap.className = '';
                infoPage.style.display = 'none';
            }else{
                
                addClass(pageWrap, 'active-page');
                contactForm.style.display = 'none';
                pageCaption.innerHTML = 'Інформація';
                pageCaption.style.display = 'block';         
                infoPage.style.display = 'block';
                overlaysArr[1].style.display= 'block';
                if (!isIE()){ 
                    animate({
                        draw: function(){
                            this.opacity-=0.05;
                            overlaysArr[1].style.opacity = this.opacity>=0 ? this.opacity : 0;
                            if(this.opacity<=0) overlaysArr[1].style.display= 'none';
                        }, 
                        opacity: 1,
                        timing: function(progress){
                            return progress;
                        },
                        duration: 1000
                        
                    });
                }else if(isIE() && isIE() < 10 ){
                    overlaysArr[1].style.display= 'none';
                }   
            }
        }else{   

            if(hasClass(pageWrap, 'active-page') && (contactForm.style.display == 'block')){
                pageWrap.className = '';
                contactForm.style.display = 'none';                
            }else{
                addClass(pageWrap, 'active-page');         
                infoPage.style.display = 'none';
                pageCaption.innerHTML = 'Зворотній зв\'язок';
                pageCaption.style.display = 'block';
                contactForm.style.display = 'block';
                overlaysArr[0].style.display= 'block';
            
                if (!isIE()){ 
                    animate({
                        draw: function(){
                            this.opacity-=0.05;
                            overlaysArr[0].style.opacity = this.opacity>=0 ? this.opacity : 0;
                            if(this.opacity<=0) overlaysArr[0].style.display= 'none';
                        }, 
                        opacity: 1,
                        timing: function(progress){
                            return progress;
                        },
                        duration: 1000
                        
                    });
                }else if(isIE() && isIE() < 10){
                    overlaysArr[0].style.display= 'none';
                }       
            }
        }

        //alert(pageWrap.className);
    }


    /* acts when clicks on page close icon*/
    function onPageClose(){
        pageWrap.className = '';
    }
    
    /* acts when chenging option - buy or sell hrivnia */
    function onCurrencyChoose(event){
        var event = event || window.event;
        var target = event.target || event.srcElement;
        var elemParent = target.parentNode;

        (target == hrivniaBut) ? (changeStatus = true, currencyType.innerHTML = activeTab.toUpperCase())
                             : (changeStatus = false, currencyType.innerHTML = 'UAH');

        //toggle active class between 'convert-to' elements
        if(!(hasClass( elemParent, 'active-offer' ))){
            elemParent.className += ' active-offer';
            currencyTabs = elemParent.parentNode.childNodes;
            for(var i=0; i<currencyTabs.length; i++){
                if(elemParent != currencyTabs[i] && hasClass( currencyTabs[i], 'active-offer' )){
                    removeClass(currencyTabs[i], 'active-offer');
                }
            }
        }
        calculate();
        preventEv(event);
    }
    
    
    /* acts when clicking on some of currencies  */    
    function onTabsClick(event){
        var event = event || window.event;
        var target = event.target || event.srcElement;
        var activeTabs = document.querySelectorAll('.active-tab');

        //toggle active class between currency elements
        if(hasClass( target, 'currency' ) && !(hasClass( target, 'active-tab' ))){
            target.className += ' active-tab';
            for(var i=0; i<activeTabs.length; i++){
                if(target != activeTabs[i] && hasClass( activeTabs[i], 'active-tab' )){
                    removeClass(activeTabs[i], 'active-tab');
                }
            }
        }
        
        if(hasClass( target, 'tab-usd' ) === true){
            chosenCurrency = 'usd';
            activeTab = 'usd';
            if(changeStatus)currencyType.innerHTML = 'USD';
        }else if(hasClass( target, 'tab-eur' ) === true){
            chosenCurrency = 'eur';
            activeTab = 'eur';
            if(changeStatus)currencyType.innerHTML = 'EUR';
        }else if(hasClass( target, 'tab-rur' ) === true){
            activeTab = 'rub';
            chosenCurrency = 'rub';
            if(changeStatus)currencyType.innerHTML = 'RUB';
        }
        
        resultSort();
        preventEv(event);
    }

    function onRadioClick(e){
        var target = e.target || e.srcElement;
        if(target ==  radioAverage){
            dropDownMenu.disabled = true;
            dropDownMenu.parentNode.className += ' disabled-state';

        }else if(target == radioBank){
            dropDownMenu.disabled = false;
            removeClass(dropDownMenu.parentNode, 'disabled-state');
        }

        calculate();
    }

    //acts when select
    function onSelectBankChange(){
        calculate();

    }

    // acts when typing in currency input field
    function onInputChange(e){
        e = e || window.e;
        var chr = getChar(e);
        
        if (chr === null) return;
        if(chr == "."){
           if(inputAmount.indexOf(".") != -1) preventEv(e); 
        }else if (chr < '0' || chr > '9') {
            preventEv(e);
        }
        
    }
    

    function onInputEndKey(){
        calculate();
    }
    

    function calculate(){
        bankName = dropDownMenu.options[dropDownMenu.selectedIndex].text;
        var chosenBankCurrencies = filteredBanks[bankName].currencies;
        var averageRadio = document.getElementById('averageCourse');
        var selectRadio = document.getElementById('bank');
        inputAmount = mainInput.value;

        if(averageRadio.checked){
            askResult = {               
                eur : (inputAmount * (1/averageAsk.eur)).toFixed(2),
                rub : (inputAmount * (1/averageAsk.rub)).toFixed(2),
                usd : (inputAmount * (1/averageAsk.usd)).toFixed(2)
            };
            bidResult = {                     
                eur : (inputAmount * averageBid.eur).toFixed(2),
                rub : (inputAmount * (1*averageBid.rub)).toFixed(2),
                usd : (inputAmount * averageBid.usd).toFixed(2)
            };
        }else if(selectRadio.checked){
            askResult = {               
                eur : chosenBankCurrencies.hasOwnProperty('EUR') ? (inputAmount * (1/chosenBankCurrencies.EUR.ask)).toFixed(2) : false,
                rub : chosenBankCurrencies.hasOwnProperty('RUB') ? (inputAmount * (1/chosenBankCurrencies.RUB.ask)).toFixed(2) : false,
                usd : chosenBankCurrencies.hasOwnProperty('USD') ? (inputAmount * (1/chosenBankCurrencies.USD.ask)).toFixed(2) : false
            };
            bidResult = {                     
                eur : chosenBankCurrencies.hasOwnProperty('EUR') ? (inputAmount * chosenBankCurrencies.EUR.bid ).toFixed(2)    : false,
                rub : chosenBankCurrencies.hasOwnProperty('RUB') ? (inputAmount * (1*chosenBankCurrencies.RUB.bid)).toFixed(2) : false,
                usd : chosenBankCurrencies.hasOwnProperty('USD') ? (inputAmount * chosenBankCurrencies.USD.bid).toFixed(2)     : false
            };
        }
        resultBody.innerHTML = "";

        if(changeStatus === true){
            tableContentGen(bidResult); 
        }else{
            tableContentGen(askResult);  
        }
        

        /* function generates table content */
        function tableContentGen(obj){

            for(var prop in obj){
                var dataRow = document.createElement('div'); // calculated currencies elem
                var sumData = document.createElement('div'); // calculated currencies elem
                var soloData = document.createElement('div'); // currency course elem
                var courseRow;
                if(averageRadio.checked){
                    courseRow = changeStatus ? averageBid[prop] : averageAsk[prop];
                }else if(selectRadio.checked){
                    if(chosenBankCurrencies.hasOwnProperty(prop.toUpperCase())){
                        courseRow  = chosenBankCurrencies[prop.toUpperCase()][changeStatus ? 'bid' : 'ask'];
                    }  
                }


             
                if(obj[prop] != false){  // data exists
                    sumData.innerHTML = obj[prop] + ' ' + (changeStatus ? 'UAH' : prop.toUpperCase());
                    soloData.innerHTML = (+courseRow).toFixed(2) + ' ' + prop.toUpperCase();
                }else if(inputAmount.length > 0 && inputAmount > 0){  //               
                    soloData.innerHTML = 'Дані';
                    sumData.innerHTML = 'відсутні';
                }else{
                    resultBody.innerHTML = "";
                    return;
                }
                
                sumData.className = 'sum-col';
                soloData.className = 'course-col';
                dataRow.className = prop + '-row';
                dataRow.appendChild(soloData);
                dataRow.appendChild(sumData);
                resultBody.appendChild(dataRow);

            }
            
            //sort
            resultSort();          
        }
    }
    
    

    //moves chosen currency row to up
    function resultSort(){
        var resultBodyChilds = resultBody.childNodes;
        var chosenCurrencyRow;
        if(resultBodyChilds.length <= 1) return;
        for(var i=0; i<resultBodyChilds.length; i++){
            var childClass = resultBodyChilds[i].className;
            if(childClass.slice(0,3) == chosenCurrency){
                chosenCurrencyRow = resultBody.removeChild(resultBodyChilds[i]);
            }
        }
        
        resultBody.insertBefore(chosenCurrencyRow, resultBodyChilds[0]);
    }
    
    
    
    
    
    
    
   
    
    /*-------------------------*/
    /*---auxiliary functions---*/
    /*-------------------------*/

    /* add event ie8+ */
    function addEvent(elem, type, handler){
        if (elem.addEventListener){
            elem.addEventListener(type, handler, false);
        } else { 
            elem.attachEvent("on"+type, handler);
        }
    }
    
    /* remove event ie8+ */
    function removeEvent(elem, type, handler){
        if (elem.removeEventListener){
            elem.removeEventListener(type, handler, false);
        } else { 
            elem.detachEvent("on"+type, handler);
        }
    }
    
    /* prevent default event */
    function preventEv(event){
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    }
    
    /* crossbrowser xmlhttprequest */
    function getXmlHttp(){
        var xmlhttp;
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (E) {
            xmlhttp = false;
        }
        }
        if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
            xmlhttp = new XMLHttpRequest();
        }
        return xmlhttp;
    }
    
    /* if element has class true/false */
    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    // event.type must be -  keypress
    function getChar(event) {
        if (event.which === null) {
            if (event.keyCode < 32) return null;
            return String.fromCharCode(event.keyCode); // IE
        }

        if (event.which !== 0 && event.charCode !== 0) {
            if (event.which < 32) return null;
            return String.fromCharCode(event.which); // others
        }

        return null; // special key
    }
    
    //add class
    function addClass(elem, cls) {
        if (!hasClass(elem, cls)) {
            elem.className += ' ' + cls;
        }
    }

    // remove class from elem
    function removeClass(elem, cls) {
        var classes = elem.className.split(' ');

        for (i = 0; i < classes.length; i++) {
            if (classes[i] == cls) {
                classes.splice(i, 1); // delete class
                i--; // (*)
            }
        }
        elem.className = classes.join(' ');
    }
    
    // function ads hendler for elems in array
    function eventForClass(elemArr, type, hendler){
        for(var i=0; i<elemArr.length; i++){
            addEvent(elemArr[i], type, hendler);
        }
    }
    
    
    //animation function
    function animate(options) {

      var start = performance.now();

      requestAnimationFrame(function animate(time) {
        // timeFraction от 0 до 1
        var timeFraction = (time - start) / options.duration;
        if (timeFraction > 1) timeFraction = 1;

        // текущее состояние анимации
        var progress = options.timing(timeFraction);

        options.draw(progress);

        if (timeFraction < 1) {
          requestAnimationFrame(animate);
        }

      });
    }

    // if user agent - ie 
    function isIE () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    }
    
})();