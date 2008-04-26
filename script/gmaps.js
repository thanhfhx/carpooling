/* ---------------------
 * FUNZIONI GoogleMap
 * --------------------- */

/** Questo oggetto rappresenta la Mappa vera e propria */
var mappa = null;

/** 
 * Questo oggetto consente di ottenere le coordinate geografiche 
 * di una localita'� (anche se in modo contorto :)
 */
var geocoder = null;

/** 
 *  Questo oggetto incapsula tutti i concetti inerenti alle
 * direzioni stradali.
 */
var gdir;
var addressMarker;


/**
  * Creazione della GMap centrata a Catania.
 * centroDefault a'� una stringa passata come argomento dal documento HTML
 */
function creaMappa(centroDefault) {
    
    /* Verifica la compatibilita'� del Browser    */
    if ( GBrowserIsCompatible() ) {
        
        /*  Aggancio della Mappa ad un elemento HTML  
            *  il numero '2' rappresenta la attuale versione della GMap    
            */
        map = new GMap2( document.getElementById("carPoolingMap") );
        
        /* Ottieni l'oggetto geocoder per ricavare le coordinate dei luoghi */
        geocoder = new GClientGeocoder();
        
        /* Inizializza la mappa. 
            * Il  principio a'� questo: ho bisogno delle coordinate geografiche
            * di un punto, ma ho solo il nome (es. Catania). Sfrutto allora
            * il metodo getLatLng che passa automaticamente alla funzione chiusura ( 2° argomento )
            * il punto che mi interessa, che si a'� calcolato sempre automaticamente.
            */
        geocoder.getLatLng( centroDefault, function( puntoGeografico ) {
            /* La localita'� non esiste*/
            if (!puntoGeografico) { 
            alert(partenza + " non e' una localita' valida."); 
        
            /* Caricamento delle coordinate del punto */
            }else {  
            /* Setta il centro. 13 e' il livello di zoom*/
            map.setCenter(puntoGeografico, 13);
            
            /* Creazione del "fumetto" di benvenuto della GMap */
            welcome = "Travel Together !"
            map.openInfoWindow(map.getCenter(),document.createTextNode(welcome));
            }
        });
        
        /* Aggiunta del pannello di zoom */
        map.addControl(new GSmallMapControl());
        
        /* Abilita lo zoom con lo scrool del mouse */
        map.enableScrollWheelZoom();
        
        /* Questa variabile identifica l'angolo in basso a sinistra della mappa.
            * Il secondo parametro a'� un offset.
            */
        var bottomLeft = new GControlPosition(G_ANCHOR_BOTTOM_LEFT, new GSize(30,10));
        
        /* Aggiunta del modificatore mappa-satellite-ibrida nell'angolo bottomLeft */
        map.addControl(new GMapTypeControl(),bottomLeft);
    }
}
    
    
/*  Crea e visualizza sulla mappa un percorso relativo a due citta'�*/
function creaPercorso() {
   mapForm = document.getElementById("mapForm"); 
    
    /* Ottieni le citta'� di partenza ed arrivo dalle caselle di testo della pagina */
    partenza = mapForm.partenzaText.value;
    arrivo = mapForm.arrivoText.value;
    
    /* Rimuove eventuali indicazioni presenti nella pagina */
    var direzioni = document.getElementById("directions");
    direzioni.innerHTML = "";
    
    /* Rappresenta un 'rettangolo di coordinate' */
    var bounds = new GLatLngBounds();
    
    /* Rappresentano i punti geografici sulla mappa */
    var puntoPartenza; 
    var puntoArrivo;
    
    /* Crea una icona base */
        var baseIcon = new GIcon();
        baseIcon.iconAnchor = new GPoint(9, 34);
        baseIcon.infoWindowAnchor = new GPoint(9, 2);
        
        /* Crea ed aggiunge il marker personalizzato alla mappa */
        var partenzaIcona = new GIcon(baseIcon);
        partenzaIcona.image = "./images/markerP.png";
        markerPOptions = { icon:partenzaIcona };
        /* Crea ed aggiunge il marker personalizzato alla mappa */
        var arrivoIcona = new GIcon(baseIcon);
        arrivoIcona.image = "./images/markerA.png";
        markerAOptions = { icon:arrivoIcona };
    
    
    /* Questa funzione ha il solo scopo di 'caricare' le coordinate del punto di arrivo,
        * secondo la logica della funzione precedente
        */
    geocoder.getLatLng(partenza, function(puntoGeografico) {
        
        /* La localita'� non esiste*/
        if (!puntoGeografico) { alert(partenza + " non e' una localita' valida."); } 
        
        /* Caricamento delle coordinate del punto */
        else {  puntoPartenza = puntoGeografico;    }});
    
    
    geocoder.getLatLng(arrivo, function(puntoGeografico) {
    
         /* La localita'� non esiste*/
        if (!puntoGeografico) {alert(arrivo + " non e' una localita' valida.");} 
        
        /* Caricamento delle coordinate del punto */
        else {  puntoArrivo = puntoGeografico;
            
            /* Rimuove eventuali altri elementi presenti sulla mappa */
            map.clearOverlays();
            
           var markerP = new GMarker(puntoPartenza, markerPOptions);
            map.addOverlay(markerP);
            /* Crea l'ascoltatore per il click del mouse, che fara'� aprire una infoWindow */
            GEvent.addListener(markerP, "click", function() { markerP.openInfoWindowHtml("<div class='gmapPopup'>Citta' di partenza : <br/><b>" + partenza+"</b></div>");});
            /* Regola lo zoom */
            fitZoom(bounds,puntoPartenza);
            
            var markerA = new GMarker(puntoArrivo, markerAOptions);
            map.addOverlay(markerA);
            /* Crea l'ascoltatore per il click del mouse, che fara'� aprire una infoWindow */
            GEvent.addListener(markerA, "click", function() { markerA.openInfoWindowHtml("<div class='gmapPopup'>Citta' di arrivo : <br/><b>" + arrivo+"</b></div>");});
             /* Regola lo zoom */
            fitZoom(bounds,puntoArrivo); 
            
           /* Aggiungi la linea del percorso */
            var percorso = new GPolyline([puntoPartenza,puntoArrivo], "#330099", 10);
            map.addOverlay(percorso);
        }
    } );
}
    

/** Regola lo zoom della mappa */
function fitZoom(bounds,point){
    
    /* Estende il rettangolo delle coordinate affincha'� contenga il punto passato come parametro */
    bounds.extend(point);
    
    /* Ottieni informationi sul corretto zoom */
    newZoom = map.getBoundsZoomLevel(bounds);
    newCenter = bounds.getCenter();
    
    /*Regola lo zoom della mappa */
    map.setCenter(newCenter,newZoom);
}
    
    
    
/** Crea le indicazioni complete per raggiungere una localita'� */
function creaIndicazioni() {
   mapForm = document.getElementById("mapForm"); 

    /* Ottieni le citta'� di partenza ed arrivo dalle caselle di testo della pagina */
    partenza = mapForm.partenzaText.value;
    arrivo = mapForm.arrivoText.value;

    if (GBrowserIsCompatible()) {
  
        /* Rimuove eventuali indicazioni gia'� presenti nella pagina */
        var direzioni = document.getElementById("directions");
        direzioni.innerHTML = "";
            
        /* Ottieni l'oggetto GDirections che costruira'� tutte le indicazioni necessarie */
        gdir = new GDirections(map, direzioni);
        
        /*Azzera lo stato della mappa */
        map.clearOverlays();
        gdir.clear();

        /*  Aggiunge il caricatore delle direzioni ed il gestore degli errori.
          *     Il primo fa riferimento alla funzione senza implementazione latestLoad.
          *     Il secondo fa riferimento alla funzione gestioneErrori poco pi� in basso.
          */
        GEvent.addListener(gdir, "load", latestLoad);
        GEvent.addListener(gdir, "error", gestioneErrori);

        /* Crea le indicazioni */
        setDirezione(partenza, arrivo, "it");
    }
}


function setDirezione(partenza, arrivo, lingua) {

/* Invia al server di google l'asserzione per ottenere le indicazioni, e stampa il risultato */	
  gdir.load("from: " + partenza + " to: " + arrivo,{ "locale": lingua });
}


/** Vari messaggi di errori che si potrebbero verificare (non tutti i casi sono contemplati) */	
function gestioneErrori(){
   if (gdir.getStatus().code == G_GEO_UNKNOWN_ADDRESS)
     alert("Non e' stato possibile trovare una localita' geografica corrispondente ad almeno una delle citta' inserite. Questo puo' essere dovuto al fatto che l'indirizzo e' relativamente nuovo, oppure  scorretto.\nCodice Errore: " + gdir.getStatus().code);
   else if (gdir.getStatus().code == G_GEO_SERVER_ERROR)
     alert("Per un errore del servere, la richiesta non e' stata processata. Non e' nota l'effettiva causa del fallimento.\n Codice errore: " + gdir.getStatus().code);
   else if (gdir.getStatus().code == G_GEO_MISSING_QUERY)
     alert("Il parametro HTTP 'q' non e' stato settato. Questo pu� verificarsi se e' stato specificato un indirizzo vuoto. \n Codice Errore: " + gdir.getStatus().code);
   else if (gdir.getStatus().code == G_GEO_BAD_KEY)
     alert("La GKey fornita non e' valida. \n Codice Errore: " + gdir.getStatus().code);
   else if (gdir.getStatus().code == G_GEO_BAD_REQUEST)
     alert("La richiesta di direzioni non e' stata sottoposta correttamente a Parsing. Controlla gli indirizzi.\n Codice Errore: " + gdir.getStatus().code);
   else alert(gdir.getStatus().code);
}

function latestLoad(){ 
/** Use this function to access information about the latest load() results.
    e.g.
    document.getElementById("getStatus").innerHTML = gdir.getStatus().code;
    and yada yada yada... */
}
    
/** Vecchie istruzioni */    
//var marker = new GMarker(point);//map.addOverlay(marker);//marker.openInfoWindowHtml(address);
//GEvent.addListener(map, "click", function() { alert("You clicked the map.");});
//markerP.openInfoWindowHtml(partenza);
//map.openInfoWindow(map.getCenter(),document.createTextNode(partenza));
//markerA.openInfoWindowHtml(arrivo);
//map.openInfoWindow(map.getCenter(),document.createTextNode(arrivo));
//GEvent.addListener(map, "click", function() { alert("You clicked the map.");});
