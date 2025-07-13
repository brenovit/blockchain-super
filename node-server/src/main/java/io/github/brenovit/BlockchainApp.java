package io.github.brenovit;

import io.vertx.core.*;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonObject;
import io.vertx.spi.cluster.hazelcast.HazelcastClusterManager;
import io.vertx.core.spi.cluster.ClusterManager;

import java.time.Instant;
import java.util.*;

public class BlockchainApp {

    public static void main(String[] args) {
        String role = System.getenv().getOrDefault("NODE_ROLE", "slave").toLowerCase();
        boolean isMaster = role.equals("master");

        ClusterManager mgr = new HazelcastClusterManager();
        VertxOptions options = new VertxOptions().setClusterManager(mgr);

        Vertx.clusteredVertx(options, res -> {
            if (res.succeeded()) {
                Vertx vertx = res.result();
                EventBus bus = vertx.eventBus();
                Blockchain blockchain = new Blockchain();

                // Master node creates the genesis block only
                if (isMaster) {
                    System.out.println("[Master] Initializing blockchain with genesis block...");
                    blockchain.initGenesis();
                }

                // Register to receive new transactions
                bus.consumer("blockchain.transaction", message -> {
                    JsonObject tx = (JsonObject) message.body();
                    blockchain.addTransaction(tx.encode());
                    System.out.println("[" + role.toUpperCase() + "] Received tx: " + tx.encodePrettily());
                });

                // Register to receive new blocks
                bus.consumer("blockchain.block", message -> {
                    JsonObject block = (JsonObject) message.body();
                    blockchain.addBlock(block);
                    System.out.println("[" + role.toUpperCase() + "] Received block: " + block.encodePrettily());
                });

                // All nodes mine blocks
                vertx.setPeriodic(15000, id -> {
                    if (!blockchain.getPendingTransactions().isEmpty()) {
                        JsonObject newBlock = blockchain.mineBlock();
                        bus.publish("blockchain.block", newBlock);
                        System.out.println("[" + role.toUpperCase() + "] Mined & broadcasted block");
                    }
                });

                // Optional: simulate submitting a transaction (slaves only)
                if (!isMaster) {
                    vertx.setPeriodic(10000, id -> {
                        JsonObject tx = new JsonObject()
                                .put("from", UUID.randomUUID().toString().substring(0, 5))
                                .put("to", UUID.randomUUID().toString().substring(0, 5))
                                .put("amount", new Random().nextInt(100));
                        bus.publish("blockchain.transaction", tx);
                    });
                }
            }
        });
    }
}

class Blockchain {
    private List<JsonObject> chain = new ArrayList<>();
    private List<String> pendingTransactions = new ArrayList<>();
    private boolean initialized = false;

    public void initGenesis() {
        if (!initialized) {
            chain.add(createGenesisBlock());
            initialized = true;
        }
    }

    public JsonObject createGenesisBlock() {
        return new JsonObject()
                .put("index", 0)
                .put("timestamp", Instant.now().toString())
                .put("transactions", new ArrayList<>())
                .put("previousHash", "0")
                .put("hash", UUID.randomUUID().toString());
    }

    public void addTransaction(String tx) {
        pendingTransactions.add(tx);
    }

    public List<String> getPendingTransactions() {
        return pendingTransactions;
    }

    public JsonObject mineBlock() {
        JsonObject lastBlock = chain.get(chain.size() - 1);
        JsonObject block = new JsonObject()
                .put("index", chain.size())
                .put("timestamp", Instant.now().toString())
                .put("transactions", new ArrayList<>(pendingTransactions))
                .put("previousHash", lastBlock.getString("hash"))
                .put("hash", UUID.randomUUID().toString());

        chain.add(block);
        pendingTransactions.clear();
        return block;
    }

    public void addBlock(JsonObject block) {
        chain.add(block);
    }

    public List<JsonObject> getChain() {
        return chain;
    }
}

