
class UserService {

    constructor() {
        this.apiURL = "http://127.0.0.1:8000/api/v1";
        // this.apiURL = "http://47.144.148.193:8000/api/v1";
    }

    async getFriends(userID) {
        const response = await fetch(`${this.apiURL}/users/friends/${userID}`);
        const data = await response.json();

        return data;
    }

    async getGroups(userID) {
        const response = await fetch(`${this.apiURL}/groups/user/${userID}`);
        const data = await response.json();

        return data;
    }
}

export default UserService;
