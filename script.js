document.querySelector("#inputForm").addEventListener("submit" , function(event){
    event.preventDefault();

    var frames = parseInt(document.querySelector("#frames").value);
    var referenceString = document.querySelector("#referenceString").value.split(",").map(Number);
    var  algorithm = document.querySelector("#algorithm").value;

    var pageFaults = 0;
    var pageHits = 0;

    var memory =[];
    var framesContainer = document.querySelector("#framesContainer");
    framesContainer.innerHTML ="";





    function updateFramesVisual(memory , faultIndex = -1 , hitIndex= -1){
        framesContainer.innerHTML = "";
        memory.forEach((page , index)=>{
            var doc = document.createElement("div");
            doc.classList.add("frame");
            doc.textContent = page;
            if(index === faultIndex){
                doc.classList.add("fault");
            }
            if(index === hitIndex){
                doc.classList.add("hit");
            }
            framesContainer.appendChild(doc);
        });
    }


    
    async function delay(ms){
        return new Promise(resolve => setTimeout(resolve , ms));
    }

    

    // Explanation of this delay function//
//     async function delay(ms)

// Declares an asynchronous function that accepts a parameter ms (milliseconds).

// return new Promise(resolve => setTimeout(resolve, ms));

// Creates a new Promise that runs setTimeout(resolve, ms).

// setTimeout(resolve, ms) waits for ms milliseconds and then calls resolve().

// Once resolve() is called, the Promise is fulfilled, and execution continues.


    async function runFifo(){
        var queue = [];
        for(var step = 0 ; step < referenceString.length ; step++){
            var page = referenceString[step];
            var fault = false;
            var hitIndex = -1;

            if(!queue.includes(page)){
                fault = true;

                if(queue.length < frames){
                    queue.push(page);
                }

                else{
                    queue.shift();
                    queue.push(page);

                }
                pageFaults++;
            }

            else{
                hitIndex = queue.indexOf(page);
                pageHits++;
            }

            updateFramesVisual(queue , fault? queue.indexOf(page): -1 ,hitIndex );
            await delay(800);
        }
    }

    

    async function runLru(){
        var memoryMap = new Map();//this is the map object used to track least recently used pages//
        for(var step = 0 ; step < referenceString.length ; step++){
            var page = referenceString[step];
            var fault = false;
            var hitIndex = -1;

            if(!memory.includes(page)){
                fault = true;
                if(memory.length < frames){
                    memory.push(page)
                }
                else{
                    var lruPage = [...memoryMap.keys()][0];
                    var index = memory.indexOf(lruPage);//... (spread operator) converts the iterator into an array.
                    memory.splice(index , 1);
                    memory.push(page);
                    memoryMap.delete(lruPage);
                }
                pageFaults++;
            }
            else{
                hitIndex = memory.indexOf(page);
                pageHits++;
            }

            memoryMap.delete(page);
            memoryMap.set(page , step); 

            updateFramesVisual(memory , fault ? memory.indexOf(page) : -1 , hitIndex);
            await delay(800);
        }

    }

    //Optimal page replacement
    async function runOptimal(){
       
        for (let step = 0; step < referenceString.length; step++) {
            let page = referenceString[step];
            let fault = false;
            let hitIndex = -1;

            if (!memory.includes(page)) {
                fault = true;
                if (memory.length < frames) {
                    memory.push(page);
                } else {
                    let futureUse = memory.map(m => referenceString.slice(step + 1).indexOf(m));
                    let indexToReplace = futureUse.includes(-1) ? futureUse.indexOf(-1) : futureUse.indexOf(Math.max(...futureUse));
                    memory[indexToReplace] = page;
                }
                pageFaults++;
            } else {
                hitIndex = memory.indexOf(page);
                pageHits++;
            }

            updateFramesVisual(memory, fault ? memory.indexOf(page) : -1, hitIndex);
            await delay(800);
        }

    }


    // Hybrid page replacement algorithm
    async function runHybrid(){
        var memoryMap = new Map();

    for (let step = 0; step < referenceString.length; step++) {
        let page = referenceString[step];
        let fault = false;
        let hitIndex = -1;
        
        // Check if enough future references exist to apply Optimal
        let isOptimalBetter = referenceString.slice(step + 1).length >= frames; 

        if (!memory.includes(page)) {
            fault = true;
            if (memory.length < frames) {
                memory.push(page);
            } else {
                if (isOptimalBetter) {
                    // Apply Optimal Replacement Strategy
                    let futureUse = memory.map(m => referenceString.slice(step + 1).indexOf(m));
                    let indexToReplace = futureUse.includes(-1) ? futureUse.indexOf(-1) : futureUse.indexOf(Math.max(...futureUse));
                    memory[indexToReplace] = page;
                    
                } else {
                    // Apply LRU Replacement Strategy
                    var lruPage = [...memoryMap.keys()][0];
                    var index = memory.indexOf(lruPage);
                    memory.splice(index, 1);
                    memory.push(page);
                    memoryMap.delete(lruPage);
                }
            }
            pageFaults++;
        } else {
            hitIndex = memory.indexOf(page);
            pageHits++;
        }

        memoryMap.delete(page);
        memoryMap.set(page, step);

        updateFramesVisual(memory, fault ? memory.indexOf(page) : -1, hitIndex);
        await delay(800);

    }
}

    if(algorithm === "FIFO" ) runFifo();
    else if(algorithm === "LRU") runLru();
    else if(algorithm === "Optimal") runOptimal();
    else if(algorithm ==="Hybrid") runHybrid();


    setTimeout(() => {
        var hitRatio = ((pageHits / referenceString.length) * 100).toFixed(2);
        document.querySelector("#pageFaults").textContent = `Total Page Faults: ${pageFaults}`;
        document.querySelector("#hitRatio").textContent = `Hit Ratio: ${hitRatio}%`;
    } , referenceString.length * 800);
 
    

});

// AI Suggestion Function
function getAISuggestion() {
    const referenceString = document.querySelector("#referenceString").value;
    if (!referenceString) {
        document.querySelector("#suggestionContent").innerHTML = 
            "<p style='color: #ff4444'>Please enter a reference string first.</p>";
        return;
    }

    try {
        const refArray = referenceString.split(",").map(Number);
        const suggestion = pageReplacementAI.suggestAlgorithm(refArray);
        
        const suggestionHTML = `
            <div class="suggestion-result">
                <p><strong>Suggested Algorithm:</strong> ${suggestion.algorithm}</p>
                <p><strong>Confidence:</strong> ${(suggestion.confidence * 100).toFixed(1)}%</p>
                <p><strong>Explanation:</strong> ${suggestion.explanation}</p>
            </div>
        `;
        
        document.querySelector("#suggestionContent").innerHTML = suggestionHTML;
        
        // Auto-select the suggested algorithm
        document.querySelector("#algorithm").value = suggestion.algorithm;
    } catch (error) {
        document.querySelector("#suggestionContent").innerHTML = 
            "<p style='color: #ff4444'>Error analyzing reference string. Please check the format.</p>";
    }
}