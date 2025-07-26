package io.github.brenovit;

import io.vertx.core.json.JsonObject;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Blockchain {
    private final List<JsonObject> chain = new ArrayList<>();
    private final List<String> pendingTransactions = new ArrayList<>();
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
        JsonObject lastBlock = chain.getLast();
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
