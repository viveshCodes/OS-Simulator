var blocks=[];
var n=10;
var htmlText;
var diskCapacity=0;
var blockCapacity=0;
var file = {id: -1 ,breq:-1 }; //status 0 == in mem
var files= [];  //store all file details
var queue =[]; //Queue for files
var front = 0;
var rear = -1;
var file_id=0;
var count_available_file=0
var queueSize=5;
var flag=0;
//-----------------------------driver-------------------------------


$(document).ready(function () {
    $("#submit-glob").click(function(){
        diskCapacity=Number($("#tot-mem").val());
        blockCapacity=Number($("#block-size").val());
        if(blockCapacity<=0 || diskCapacity<=0){
            alert("Invalid Input");
        }
        else{
            n=diskCapacity/blockCapacity;
            n=parseInt(n);
            updateBlockCapacity();
            htmlText=
            `
            <div id="disk-info">
                <div id="mem-info">Disk Capacity: ` +String(diskCapacity)+`</div>
                <div id="block-info">Block Capacity:`+String(blockCapacity)+`</div>
                <div id="block-count">Total Blocks:`+String(n)+`</div>
            </div>
            <br>
            `
            $("#global").html(htmlText);
    
            initilize();
        }
        
    });
    
});
function initilize(){
    for(var i=0;i<n;i++)
    {
        blocks.push({fid: -1,next:-1})
        
    }
    for(var i =0;i<queueSize;i++)
    {
        queue.push({id: -1,breq: -1 });
    }
    for(var i=0;i<50;i++)
    {
        files.push({name:"",id: -1 ,size:-1,breq:-1,status:0,start:-1 })
    }
    listen();
}

function listen()
{
    htmlText=
    `
    <p>
        <span><button class="btn btn-primary" id="add-file" type="button" >Add File</button></span>
        <span><button class="btn btn-primary" id="delete-file" type="button">Delete File</button></span>
        <span><button class="btn btn-primary" id="search-file" type="button">Search File</button></span>
    </p>
    `;
    $("#file-input").html(htmlText);

    $(document).ready(function() {
        $("#add-file").click(function(){
            file_id++;
            InputUI();
        }); 
    });
    $(document).ready(function() {
        $("#delete-file").click(function(){
            DeleteUI();
        }); 
    });
    $(document).ready(function() {
        $("#search-file").click(function(){
            $("#search-query").html("");
            SearchUI();
        }); 
    });
}




//------------------------------------- Input UI-------------------------

function InputUI(){

    htmlText =
        `
        <div class="form-group">
            <lebel class="col-form-label" for="file-name-`+String(file_id)+`">File Name</lebel>
            <input class="form-control" type="text" id="file-name-`+String(file_id)+`"  placeholder="">
            <input hidden class="form-control" type="text" id="file-id-`+String(file_id)+`"  value="`+String(file_id)+`">
            <lebel class="col-form-label" for="file-name-`+String(file_id)+`">File Size</lebel>
            <input class="form-control"  type="text" id="file-size-`+String(file_id)+`" placeholder="">
        </div>
        `;
    htmlText +=
    `
    <button class="btn btn-success" id="allocate-file" type="submit">Allocate</button>
    `;
    $("#query-input").html(htmlText);
    
    $(document).ready(function() {
        $("#allocate-file").click(function(){
            AddFile(file_id);
            $("#query-input").html(""); 
            printAll();
        }); 
    });

}

function AddFile(file_id){
    var id=Number($("#file-id-"+String(file_id)).val());
    var size=Number($("#file-size-"+String(file_id)).val());
    var name=$("#file-name-"+String(file_id)).val();
    
    if(isNaN(size))
    {
        alert("Size = "+$("#file-size-"+String(fid)).val()+" is not a valid input Must be numeric");
        print("AddFile: Invalid size variable","output-log");
        return;
    }
    else if(size<=0||name=='')
    {
        alert("size = "+size+" or Name = "+name+" is not a valid input");
        print("AddFile: Invalid size or File Name variable","output-log");
        return;
    }
    else if(isUniqe(name)){
        var breq=ceilDivision(size, blockCapacity);
        if(freeMemory() < breq)
        {
            if(flag){
                file = {id,breq};
                queue[++rear] = file;
                AddToFileList(name,id,size,breq,1,-1);
                print("Addfile: file Id: "+id+"  Not enough memory Added to Queue","output-log");
            }
            else{
                alert("Not enough memory");
            }
        }
        else
        {
            var prev = freeSlot();
            blocks[prev].fid = id;
            AddToFileList(name,id,size,breq,0,prev);
            print("AddFile: File Id: "+id+" Added in disk","output-log");
            breq--;
            while(breq--)
            {
                var pos = freeSlot();
                blocks[prev].next = pos;
                blocks[pos].fid = id;
                prev = pos;
            }
    
            blocks[prev].next = -1;

        }
    }
    else{
        alert("file name "+name+ " already available in directory");
    }
    
}
function isUniqe(name){
    for(var i=0;i<count_available_file;i++)
    {
        if(files[i].name==name)
        {
            return false;
        }
    }
    return true;
}

function ceilDivision(a,b){
	return parseInt(a/b) + (a%b != 0);
}

function freeSlot(){
	for(var i=0; i<n; i++)
		if(blocks[i].fid == -1)
			return i;
}

function freeMemory(){
	var ret = 0;
	for(var i=0; i<n; i++)
		if(blocks[i].fid == -1)
			ret++;
	return ret;
}
function updateBlockCapacity()
{
	var p=0;
	while((1<<p) < n)
		p++;

	p = ceilDivision(p, 8); //Bytes
	blockCapacity -= p;
}

//--------------------------------------------- Delete UI --------------------------------------

function DeleteUI(){
    htmlText =
        `
        <div class="form-group">
            <lebel class="col-form-label" for="file-id">File Id</lebel>
            <input class="form-control"  type="text" id="file-id" placeholder="">
        </div>
        `;
    htmlText +=
    `
    <button class="btn btn-danger" id="remove-file" type="submit">Delete</button>
    `;

    $("#query-input").html(htmlText);
    
    $(document).ready(function() {
        $("#remove-file").click(function(){
            var id=Number($("#file-id").val());
            DeleteFile(id);
            $("#query-input").html("");         
            printAll();
    
        }); 
    });
}

function DeleteFile(id){
    var flag=0;
    for(var i=0; i<n; i++){
        if(blocks[i].fid == id){
            blocks[i].fid = -1;
            blocks[i].next = -1;
            flag=1;
        }
    }
    if(flag==0){
        alert("file id: "+id+" not available in disk");
        print("DeleteFile: File id: "+id+" not available in Disk","output-log");

    }
    else{
        changeFileStatus(id,"delete",0);
        print("DeleteFile: File id: "+id+" is Deleted from Disk","output-log");
        if(flag){
            insertFilesFromQueue();
        }
    }
}

function insertFilesFromQueue()
{
	for(var i=front; i<=rear; i++)
	{
		if(freeMemory() < queue[i].breq)
			print("InsertFileFromQueue: File id "+queue[i].id+" Not enough memory\n", queue[i].id);
		else
		{
            var prev = freeSlot();
            changeFileStatus(queue[i].id,"update",prev);
            print("insertFilesFromQueue: File id: "+queue[i].id+" Moved from Queue to Disk","output-log");
			
			blocks[prev].fid = queue[i].id;

			var siz = queue[i].breq;
			siz--;
			while(siz--)
			{
				var pos = freeSlot();
				blocks[prev].next = pos;
				blocks[pos].fid = queue[i].id;
				prev = pos;
			}

			blocks[prev].next = -1;
		}
	}
}



//---------------------------------------------- Search UI --------------------------
function SearchUI()
{
    htmlText =
        `
        <div class="form-group">
            <lebel class="col-form-label" for="file-id">File Id</lebel>
            <input class="form-control" type="text" id="file-id" placeholder="">
        </div>
        `;
    htmlText +=
    `
    <button class="btn btn-info" id="file-search" type="submit">Search</button>
    `;

    $("#query-input").html(htmlText);
    
    $(document).ready(function() {
        $("#file-search").click(function(){
            var id=Number($("#file-id").val());
            if(id<=0||isNaN(id)){
                alert("File Id "+id+" is not a valid input");
                $("#search-query").html("");
            }
            else{
                Search(id);
            }
            $("#query-input").html("");         
            //printDisk();    
        }); 
    });
}

function Search(id){
    var flag = 0;
    for(var i=0; i<n; i++)
        flag += (blocks[i].fid == id);

    if(!flag)
    {
        print("Search: File id: "+id+"  not found in Disk","output-log");
        alert("file Id: "+id+" not found in disk");
    }
        
    else
    {
        print("Search: File Id: "+id+" Found","output-log");
        htmlText=
        `
        <strong>Search Result</strong>
        <hr>
        <p>Blocks Ids in  which File Id: `+id+` is present is</p>
        <p>
        `;
        var t;
        for(var i=0; i<n; i++)
            if(blocks[i].fid == id)
            {
                t = i;
                break;
            }

        while(blocks[t].next != -1)
        {
            htmlText+=
            `
            <span class="badge badge-pill badge-info">`+t+`</span>->
            `;
            t = blocks[t].next;
        }
        //print("<span>"+t+"</span>","search-query");
        htmlText+=
            `
            <span class="badge badge-pill badge-info">`+t+`</span>
            </p>
            <hr>
            `;
        $("#search-query").html(htmlText);
    }
}

//----------------------------------- Utility functions ----------------------------


function printDisk(){
    htmlText=
    `<br>
    <strong><p>Disk Status</p></strong><hr>
    <div id="disk-row">
    `;
    for(var i=0;i<n;i++){
        if(blocks[i].fid == -1){
            htmlText+=
            `
            <span class="tooltip" id="block-`+i+`">
            <button type="button" class="btn btn-danger"  onclick="randomAllocate(`+i+`)">`+String(blocks[i].fid)+`</button>
            <span class="tooltiptext">`+ViewBlocks(i)+`</span>
            </span>
            `;
        }
        else{

            htmlText+=
            `
            <span class="tooltip">
            <button type="button" class="btn btn-success">`+String(blocks[i].fid)+`</button>
            <span class="tooltiptext">`+ViewBlocks(i)+`</span>
            </span>
            `
            ;

        }
    }
    $("#disk-status").html(htmlText);

}

function randomAllocate(bid){
    blocks[bid].fid=parseInt(50+Math.random()*1000);
    htmlText=
    `
    <button type="button" class="btn btn-success">`+String(blocks[bid].fid)+`</button>
    <span class="tooltiptext">`+ViewBlocks(bid)+`</span>
    `;
    $("#block-"+bid).html(htmlText);
}

function ViewBlocks(bid){
    var i=findFile(blocks[bid].fid);
    if(i!=-1){
        
        htmlText=
        `
        <div id="block-detail">
            <p><div>Block Id: `+bid+`</div>
            <div>Block content type: Data</div>
            <div>File id: `+blocks[bid].fid+`</div>
            <div>File Name:`+files[i].name+`</div>
            <div>File Size:`+files[i].size+`</div>
            <div>Total Block req:`+files[i].breq+`</div></p>
        </div>
        `;
    }
    else{
        htmlText=
    `
    <div id="block-detail">
        <p><div>Block Id: `+bid+`</div>
        <div>File id: `+blocks[bid].fid+`</div></p>
    </div>
    `;
    }
    return(htmlText);
    
}

function findFile(id){
    for(var i=0;i<count_available_file;i++){
        if(files[i].id==id){
            return i;
        }

    }
    return -1;
}

function printFiles(){

    htmlText=
    `
    <br>
    <strong><p>File Status:</p></strong><hr>
    <table class="table table-striped">
            <thead>
                <tr>
                    <th scope="col">File Name</th>
                    <th scope="col">File ID</th>
                    <th scope="col">File Size</th>
                    `+isqueue()+`                                                
                </tr>
            </thead>
        <tbody>  
      
    `;
    for(var i=0;i<count_available_file;i++)
    {
        htmlText+=
        `
            <tr class="table-primary">
                <td>`+files[i].name+`</td>
                <td>`+files[i].id+`</td>
                <td>`+files[i].size+`</td>
                `+Whatis(i)+`
            </tr>            
        `;
    }
    htmlText+=
    `
    </tbody>
    </table>
    ` ;   
    $("#file-status").html(htmlText);
}

function isqueue(){
    if(flag){
        return `<th scope="col">File Status</th><th scope="col">Start Blk</th>`
    }
    else return `<th scope="col">Start Blk</th>`;
}
function Whatis(i){
    if(flag){
        if(files[i].status==0){
            return `<td>In disk</td><td>`+files[i].start+`</td>` ;
        }
        else if(files[i].status==1){
            return `<td>In queue</td><td>`+files[i].start+`</td>`;
        }
    }
    else return `<td>`+files[i].start+`</td>` ;
}
function printQueue() {
    htmlText=
    `
    <br>
    <strong><p>Queue Status:</p></strong><hr>
    <table class="table table-striped">
        <div id="file-details-strc">
            <thead>
                <tr>
                    <th scope="col">File Id</th>
                    <th scope="col">Block req</th>            
                </tr>
            </thead>
        </div> 
        <tbody>  
    `;
    for(var i=front; i<=rear; i++)
	{
        htmlText+=
        `
        <div id="file-details">
            <tr class="table-info">
                <td>`+queue[i].id+`</td>
                <td>`+queue[i].breq+`</td>
            </tr>            
        </div>
        `;
    }
    htmlText+=
    `
    </tbody>
    </table>
    ` ;   
    $("#queue-status").html(htmlText);
}
function AddToFileList(name,id,size,breq,status,start){
    var filed={name,id,size,breq,status,start};
    files[count_available_file++]=filed;
}

function changeFileStatus(id,todo,pos){
    var flag=0;
    for(var i=0;i<count_available_file;i++)
    {
        if(files[i].id==id)
        {
            if(todo=="update")
            {
                files[i].status=0;
                files[i].start=pos;
            }
            else if(todo=="delete")
            {
                for(var j=i;j<count_available_file;j++)
                {
                    files[j]=files[j+1];
                }
                flag=1;
            }
            break;
        }
    }
    if(flag)
    {
        count_available_file--;
    }
}

function print(str,x) {
    htmlText=
    `
    <p>`+str+`</p>
    `;
    $("#"+x).append(htmlText);    
}
function printAll(){
    printFiles();
    if(flag){
        printQueue();
    }
    printDisk();
}