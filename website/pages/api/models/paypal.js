import mongoose from 'mongoose';


const schema = mongoose.Schema({
    id: { type: String, required: true },
    status: { type: String, required: true },
    priceplan: { type: String, required: true },
    purchase_units: { type: Array, default: [] },
    links: { type: Array, default: [] },
    payment_source: {
        type: Object, default: {
            paypal: {
                email_address: "",
                account_id: "",
                account_status: "",
                name: {
                    given_name: "",
                    surname: ""
                },
                address: {
                    country_code: ""
                },
            }
        }
    },
    payer: {
        type: Object, default: {
            name: {
                given_name: "",
                surname: ""
            },
            email_address: "",
            payer_id: "",
            address: {
                country_code: "US"
            }
        }
    },

},
    {
        timestamps: true,
    });

export default mongoose.models.Paypal || mongoose.model('Paypal', schema);
