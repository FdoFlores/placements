const bcrypt = require('bcryptjs');
const helpers = {};

helpers.encryptPassword = async(password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

helpers.matchPassword = async(password, savedPassword) => {
    try{
        return await bcrypt.compare(password, savedPassword);
    }catch(e){
        console.log(e);
    }
};

helpers.specialchars = (inputs) => {
    console.log("Entra: ",inputs);
    inputs = ""+inputs;
    if(inputs.match(/[^\w\s.@./]/gi)){
        console.log(inputs, "No se puede");
        return true;
    }
    
    return false;
}


helpers.verifrank = (input) => {
    switch(input) {
        case "Iron 4":
          return 1;
          break;
        case "Iron 3":
            return 2;
            break;
        case "Iron 2":
            return 3;
            break;
        case "Iron 1":
            return 4;
            break;
        case "Bronze 4":
            return 5;
            break;
        case "Bronze 3":
            return 6;
            break;
        case "Bronze 2":
            return 7;
            break;
        case "Bronze 1":
            return 8;
            break;
        case "Silver 4":
            return 9;
            break;
        case "Silver 3":
            return 10;
            break;
        case "Silver 2":
            return 11;
            break;
        case "Silver 1":
            return 12;
            break;
        case "Gold 4":
            return 13;
            break;
        case "Gold 3":
        return 14;
            break;
        case "Gold 2":
        return 15;
            break;
        case "Gold 1":
            return 16;
            break;
        case "Platinum 4":
            return 17;
            break;
        case "Platinum 3":
        return 18;
            break;
        case "Platinum 2":
        return 19;
            break;
        case "Platinum 1":
            return 20;
            break;
        case "Diamond 4":
            return 21;
            break;
        case "Diamond 3":
        return 22;
            break;
        case "Diamond 2":
        return 23;
            break;
        case "Diamond 1":
            return 24;
            break;
        case "Master":
            return 25;
            break;
        default:
            console.log('nada...');
          return -1;
      }
}


module.exports = helpers;