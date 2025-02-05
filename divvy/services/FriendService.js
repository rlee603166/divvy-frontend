class FriendService {
    constructor() {
        this.apiUrl = "http://127.0.0.1:8000/api/v1";
    }

    createFriend(friend) {
        const response = await fetch(`${this.apiUrl}`);
    }
}
