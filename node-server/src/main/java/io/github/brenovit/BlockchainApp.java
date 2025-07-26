package io.github.brenovit;

import io.vertx.core.Vertx;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonObject;
import io.vertx.core.spi.cluster.ClusterManager;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.spi.cluster.hazelcast.HazelcastClusterManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Random;
import java.util.UUID;

public class BlockchainApp {

    private static final Logger log
            = LoggerFactory.getLogger(BlockchainApp.class);

    public static void main(String[] args) {
        log.info("Starting BlockchainApp");
        var role = System.getenv().get("NODE_ROLE");
        var httpServerEnabled = Boolean.getBoolean(System.getenv().getOrDefault("HTTP_SERVER_ENABLED", "false"));

        if(role == null) {
            throw new RuntimeException("Node role is not set");
        }
        boolean isMaster = role.equals("master");

        ClusterManager mgr = new HazelcastClusterManager();

        var f = Vertx.builder()
                .withClusterManager(mgr)
                .buildClustered();

        if (f.succeeded()) {
            Vertx vertx = f.result();
            
            log.info("Cluster manager started");
            EventBus bus = vertx.eventBus();
            Blockchain blockchain = new Blockchain();

            // Master node creates the genesis block only
            if (isMaster) {
                log.info("[Master] Initializing blockchain with genesis block...");
                blockchain.initGenesis();
            }

            // Register to receive new transactions
            bus.consumer("blockchain.transaction", message -> {
                JsonObject tx = (JsonObject) message.body();
                blockchain.addTransaction(tx.encode());
                log.info("[" + role.toUpperCase() + "] Received tx: " + tx.encodePrettily());
            });

            // Register to receive new blocks
            bus.consumer("blockchain.block", message -> {
                JsonObject block = (JsonObject) message.body();
                blockchain.addBlock(block);
                log.info("[" + role.toUpperCase() + "] Received block: " + block.encodePrettily());
            });

            // All nodes mine blocks
            vertx.setPeriodic(15000, id -> {
                if (!blockchain.getPendingTransactions().isEmpty()) {
                    JsonObject newBlock = blockchain.mineBlock();
                    bus.publish("blockchain.block", newBlock);
                    log.info("[" + role.toUpperCase() + "] Mined & broadcasted block");
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

            if(httpServerEnabled) {
                log.info("Starting HTTP server");

                // HTTP API
                Router router = Router.router(vertx);
                router.route().handler(BodyHandler.create());

                router.get("/blocks").handler(ctx -> {
                    ctx.response()
                            .putHeader("Content-Type", "application/json")
                            .end(blockchain.getChain().toString());
                });

                router.post("/transactions").handler(ctx -> {
                    JsonObject tx = ctx.body().asJsonObject();
                    bus.publish("blockchain.transaction", tx);
                    ctx.response().setStatusCode(202).end("Transaction accepted\n");
                });

                vertx.createHttpServer()
                        .requestHandler(router)
                        .listen(8080)
                        .onSuccess(server -> log.info("HTTP server running on port 8080"))
                        .onFailure(err -> log.error("HTTP server failed: {}", err.getMessage()));
                log.info("Http server started on port 8080");

            }
        }

        if(f.failed()){
            throw new RuntimeException("[BlockchainApp] failed to start");
        }
    }
}


