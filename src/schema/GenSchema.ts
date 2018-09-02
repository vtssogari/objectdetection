import {SchemaArray, SchemaObject, SchemaScala, firstLetterCap} from "./SchemaInterface"

function isPlainObject(obj: any) {
    return obj ? typeof obj === 'object' : false;
        //&& Object.getPrototypeOf(obj) === Object.prototype : false;
}

const supportType = ['string', 'number', 'array', 'object', 'boolean', 'integer'];

function getType(type: string) {
    if (!type) {type = 'string'};
    if (supportType.indexOf(type) !== -1) {
        return type;
    }
    return typeof type;
}

function handlScala(obj:Object, name:string):SchemaScala {
    let schema = new SchemaScala();
    schema.name = name;
    schema.type = getType(typeof obj);
    return schema;
}

function handleArray(arr: any, name:string):SchemaArray {
    const child = parse(arr[0],name);
    let childProperty: SchemaObject|SchemaScala;
    if(child instanceof SchemaObject){
        childProperty = child as SchemaObject;
    }else{
        childProperty = child as SchemaScala;
    }
    let schema: SchemaArray = new SchemaArray();
    schema.name = name;
    schema.property = childProperty;
    return schema;
}

function handleObject(json: any, name: string) : SchemaObject{
    let schema: SchemaObject = new SchemaObject();
    schema.name = name;
    schema.properties =  new Array<SchemaObject|SchemaArray|SchemaScala>();
    for (let key in json) {
        let child: SchemaObject|SchemaArray|SchemaScala = parse(json[key], key);
        schema.properties.push(child);
    }
    return schema;
}

function parse(obj: Object, name: string): SchemaObject|SchemaArray|SchemaScala {
    var schema:SchemaObject|SchemaArray|SchemaScala;
    if (Array.isArray(obj)) {
        schema = handleArray(obj, name);
    } else if (isPlainObject(obj)) {
        schema = handleObject(obj, name);
    } else {
        schema = handlScala(obj, name)
    }
    return schema;
}

export class GenSchema{
    objects: Array<SchemaObject>;
    public generate(jsonObj: Object):Array<SchemaObject>{
        this.objects = new Array<SchemaObject>();
        let schema = generateSchema(jsonObj);
        this.loop(schema);
        let uniqueTypes = this.removeDuplicateUsingSet(this.objects);

        uniqueTypes.forEach( t1  => {
            let list = uniqueTypes.filter( t2 => {return (t1.name == t2.name && t2.typeName == '')});
            let tIndex = 1;
            if(list.length > 1){
                list.forEach(item => {
                    item.typeName = firstLetterCap(item.name) + "_" + tIndex;
                    tIndex++;
                });
            }
            
        })
        return uniqueTypes;
    }

    private removeDuplicateUsingSet(arr:Array<SchemaObject>):Array<SchemaObject>{
        let unique_array = Array.from(new Set<SchemaObject>(arr))
        return unique_array
    }
    
    private loop(obj:SchemaObject|SchemaArray|SchemaScala){

        if(obj instanceof SchemaObject){
            this.objects.push(obj);

            obj.properties.forEach( child => {
                this.loop(child);
            })
        }
        if(obj instanceof SchemaArray){
            let a = obj as SchemaArray;
            this.loop(a.property);
        }
    }
}


function generateSchema(jsonData: Object):SchemaObject|SchemaArray|SchemaScala{
    return parse(jsonData, "Query");
}
