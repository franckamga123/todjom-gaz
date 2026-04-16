const { User, Supplier, Distributor, Product, Order, Payment, sequelize } = require('./backend/src/models');
const { Op } = require('sequelize');

async function seedDemoOrders() {
    try {
        console.log('--- SEEDING DEMO ORDERS ---');
        
        // 1. Find or create a client
        let client = await User.findOne({ where: { role: 'client' } });
        if (!client) {
            console.log('Creating demo client...');
            client = await User.create({
                full_name: 'Client Démo',
                phone: '90000001',
                email: 'demo@todjom.com',
                password: 'password123',
                role: 'client',
                is_active: true,
                is_verified: true
            });
        }

        // 2. Find a supplier
        const supplier = await Supplier.findOne({ include: [{ model: User, as: 'user' }] });
        if (!supplier) {
            console.log('No supplier found to link orders to.');
            return;
        }

        // 3. Find products
        const products = await Product.findAll({ where: { supplier_id: supplier.id } });
        if (products.length === 0) {
            console.log('No products found for this supplier.');
            return;
        }

        // 4. Create orders for the last 15 days
        const statuses = ['delivered', 'delivered', 'delivered', 'delivered', 'cancelled', 'delivered'];
        
        for (let i = 0; i < 25; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 15));
            
            const product = products[Math.floor(Math.random() * products.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const amount = product.price;
            const commission = amount * 0.05;

            const order = await Order.create({
                order_number: 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                client_id: client.id,
                supplier_id: supplier.id,
                product_id: product.id,
                quantity: 1,
                total_amount: amount,
                commission_amount: commission,
                status: status,
                delivery_address: 'Quartier Plateau, Niamey',
                lat: 13.5127,
                lng: 2.1128,
                payment_status: status === 'delivered' ? 'paid' : 'pending',
                created_at: date,
                updated_at: date,
                delivered_at: status === 'delivered' ? date : null
            });

            if (status === 'delivered') {
                await Payment.create({
                    order_id: order.id,
                    amount: amount,
                    method: 'My Nita',
                    transaction_id: 'TRX-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                    status: 'completed',
                    created_at: date
                });
            }
        }

        console.log('SUCCESS: Generated 25 demo orders.');
        process.exit(0);
    } catch (error) {
        console.error('ERROR SEEDING:', error);
        process.exit(1);
    }
}

seedDemoOrders();
