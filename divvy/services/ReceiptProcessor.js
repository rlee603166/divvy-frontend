export class Person {
    constructor(name, id, phone = null) {
        this.name = name;
        this.id = id || null;
        this.phone = phone;
        this.items = [];
        this.subtotal = 0;
    }

    addItem(item) {
        this.items = [...this.items, item];
        this.subtotal = this.items.reduce((total, item) => total + item.getPricePer(), 0);
    }

    setItems(items) {
        this.items = items;
        this.subtotal = this.items.reduce((total, item) => total + item.getPricePer(), 0);
    }

    getItems() {
        return this.items;
    }

    getName() {
        return this.name;
    }

    toString() {
        return `<Person ${this.name}>`;
    }
}

export class Item {
    constructor(name, price, users) {
        this.name = name;
        this.price = price;
        this.users = users;
    }

    getName() {
        return this.name;
    }

    getPricePer() {
        return this.price / this.users;
    }
}

export default class ReceiptProcessor {
    constructor() {
        self.people = {};
    }

    getPeopleHashMap() {
        const inverted = Object.entries(self.people).reduce((acc, [name, id]) => {
            acc[id] = name;
            return acc;
        }, {});

        return inverted;
    }

    processTransaction(receipt, group) {
        const personTotals = {};
        group.members.forEach(person => {
            personTotals[person.id] = new Person(person.name, person.id);
            self.people[person.phone] = person;
        });

        receipt.items.forEach(item => {
            const size = item.people.length;
            item.people.forEach(person => {
                personTotals[person].addItem(new Item(item.name, item.price, size));
            });
        });

        return personTotals;
    }

    processAdditionalCharges(subtotal, group, processedReceipt, additionals) {
        const { tip, tax, misc } = additionals;
        const roundToTwo = num => Math.round(num * 100) / 100;
        const charges = { tip, tax, misc };
        let highestPayer = group.members[0];
        let actualTotals = { tip: 0, tax: 0, misc: 0 };

        group.members.forEach(person => {
            const personID = self.people[person.phone].id;
            const ratio = processedReceipt[personID].subtotal / subtotal;
            processedReceipt[personID].tip = roundToTwo(tip * ratio);
            processedReceipt[personID].tax = roundToTwo(tax * ratio);
            processedReceipt[personID].misc = roundToTwo(misc * ratio);
            actualTotals.tip += processedReceipt[personID].tip;
            actualTotals.tax += processedReceipt[personID].tax;
            actualTotals.misc += processedReceipt[personID].misc;

            if (
                processedReceipt[personID].subtotal >
                processedReceipt[self.people[highestPayer.phone].id].subtotal
            ) {
                highestPayer = person;
            }

            processedReceipt[personID].finalTotal =
                processedReceipt[personID].subtotal +
                processedReceipt[personID].tip +
                processedReceipt[personID].tax +
                processedReceipt[personID].misc;
        });

        ["tip", "tax", "misc"].forEach(chargeType => {
            const difference = roundToTwo(charges[chargeType] - actualTotals[chargeType]);
            if (difference !== 0) {
                processedReceipt[self.people[highestPayer.phone].id][chargeType] = roundToTwo(
                    processedReceipt[self.people[highestPayer.phone].id][chargeType] + difference
                );
                processedReceipt[self.people[highestPayer.phone].id].finalTotal += difference;
            }
        });

        Object.assign(processedReceipt, { tip, tax, misc });
        return processedReceipt;
    }

    processReceipt(receipt, group) {
        const result = this.processTransaction(receipt, group);
        const final = this.processAdditionalCharges(
            receipt.subtotal,
            group,
            result,
            receipt.additional
        );

        return final;
    }
}

export function formatForAPI(processedReceipt, receipt_id) {
    const { tip = 0, tax = 0, misc = 0 } = processedReceipt;

    const personEntries = Object.entries(processedReceipt).filter(
        ([key, value]) => value instanceof Person
    );

    return {
        receipt_id,
        summary: {
            tip,
            tax,
            misc,
            subtotal: personEntries.reduce((sum, [_, person]) => sum + person.subtotal, 0),
            total: personEntries.reduce((sum, [_, person]) => sum + person.finalTotal, 0),
        },
        splits: personEntries.map(([_, person]) => ({
            name: person.name,
            id: person.id,
            ...(person.phone &&
            /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(person.id)
                ? { phone: person.phone }
                : {}),
            subtotal: person.subtotal,
            finalTotal: person.finalTotal,
            tip: person.tip || 0,
            tax: person.tax || 0,
            misc: person.misc || 0,
            items: person.items.map(item => ({
                name: item.getName(),
                price: item.getPricePer(),
                totalPrice: item.price,
            })),
        })),
    };
}
