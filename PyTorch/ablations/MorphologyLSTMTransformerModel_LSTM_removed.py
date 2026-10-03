class MorphologyLSTMTransformerModel_LSTM_removed(torch.nn.Module):
    def __init__(self, token_vocab_size=4539, token_embedding_dim=256, token_seq_length=transformer_window_length, attention_heads=4, trans_layers=4, char_vocab_size=38, char_embedding_dim=32, lstm_hidden_size=64, lstm_layers=1, tag_slots_num=11, tag_slot_embedding_dim=32):
        super().__init__()


        self.token_embedder = torch.nn.Embedding(num_embeddings=token_vocab_size, embedding_dim=token_embedding_dim, padding_idx=0)
        self.positional_embedder = torch.nn.Embedding(num_embeddings=token_seq_length, embedding_dim=token_embedding_dim)
        transformer_encoder_layer = torch.nn.TransformerEncoderLayer(d_model=token_embedding_dim, nhead=attention_heads, dim_feedforward=4*token_embedding_dim, batch_first=True)
        self.transformer = torch.nn.TransformerEncoder(transformer_encoder_layer, trans_layers)

        self.char_embedder = torch.nn.Embedding(num_embeddings=char_vocab_size, embedding_dim=char_embedding_dim, padding_idx=0)
        self.char_dropout = torch.nn.Dropout(0.1)
        self.lstm = torch.nn.LSTM(input_size=char_embedding_dim, hidden_size=lstm_hidden_size, num_layers=lstm_layers, batch_first=True, bidirectional=True)

        self.decoder_gru = torch.nn.GRU(input_size=token_embedding_dim+tag_slot_embedding_dim+16, hidden_size=128, batch_first=True)

        self.gru_tag_slot_embedders = torch.nn.ModuleList([
            torch.nn.Embedding(num_embeddings=len(pos_dict), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[0]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[1]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[2]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[3]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[4]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[5]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[6]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[7]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[8]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[9]), embedding_dim=tag_slot_embedding_dim)
        ])
        self.gru_slot_positional_embedder = torch.nn.Embedding(num_embeddings=tag_slots_num, embedding_dim=16)
        self.gru_START_embedding = torch.nn.Parameter(torch.randn(tag_slot_embedding_dim))
        self.gru_classifier_heads = torch.nn.ModuleList([
            torch.nn.Linear(128, len(pos_dict)),
            torch.nn.Linear(128, len(morph_slots_dicts[0])),
            torch.nn.Linear(128, len(morph_slots_dicts[1])),
            torch.nn.Linear(128, len(morph_slots_dicts[2])),
            torch.nn.Linear(128, len(morph_slots_dicts[3])),
            torch.nn.Linear(128, len(morph_slots_dicts[4])),
            torch.nn.Linear(128, len(morph_slots_dicts[5])),
            torch.nn.Linear(128, len(morph_slots_dicts[6])),
            torch.nn.Linear(128, len(morph_slots_dicts[7])),
            torch.nn.Linear(128, len(morph_slots_dicts[8])),
            torch.nn.Linear(128, len(morph_slots_dicts[9]))
        ])

        self.token_embedding_dim = token_embedding_dim
        self.lstm_hidden_size = lstm_hidden_size
        self.register_buffer("position_ids", torch.arange(token_seq_length).unsqueeze_(0))
        self.register_buffer("gru_slot_ids", torch.arange(11).unsqueeze_(0))
        self.register_buffer("word_offsets", torch.zeros(242536)) #DELETE

    def gru_decode_training(self, combined_final_word_vectors, flat_pos_window_tensors, flat_morph_tag_window_tensors):

        N = combined_final_word_vectors.shape[0]
        flat_word_vectors_gru_expanded = combined_final_word_vectors.unsqueeze(1).expand(-1, 11, -1)
        slot_embeddings = self.gru_slot_positional_embedder(self.gru_slot_ids.expand(N, -1))
        gru_START_embedding = self.gru_START_embedding.unsqueeze(0).expand(N, -1)

        prev_tag_embeddings = [gru_START_embedding.unsqueeze(1), self.gru_tag_slot_embedders[0](flat_pos_window_tensors).unsqueeze(1)]
        for i in range(1, 10):
            prev_tag_embeddings.append(self.gru_tag_slot_embedders[i](flat_morph_tag_window_tensors[:, i-1]).unsqueeze(1))
            #print(self.gru_tag_slot_embedders[i], flat_pos_morph_tag_tensors[:, i])

        prev_tag_embeddings = torch.cat(prev_tag_embeddings, dim=1)
        #print(flat_word_vectors_gru_expanded.shape, prev_tag_embeddings.shape, slot_embeddings.shape)

        gru_input = torch.cat([flat_word_vectors_gru_expanded, prev_tag_embeddings, slot_embeddings], dim=2)

        gru_output = self.decoder_gru(gru_input)[0]

        output_logits = []
        for j in range(11):
            output_logits.append(self.gru_classifier_heads[j](gru_output[:, j, :]))
        return output_logits

    def gru_decode_inference(self, combined_final_word_vectors):

        N = combined_final_word_vectors.shape[0]
        flat_word_vectors_gru_unsqueezed = combined_final_word_vectors.unsqueeze(1) #(N, 1, 384)
        slot_embeddings = self.gru_slot_positional_embedder(self.gru_slot_ids.expand(N, -1)) #(N, 11, 16)
        gru_START_embedding = self.gru_START_embedding.unsqueeze(0).expand(N, -1) #(N, 32)

        output_logits = []
        predicted_idces = []

        gru_hidden = combined_final_word_vectors.new_zeros(1, N, 128)
        prev_tag_embedding = gru_START_embedding.unsqueeze(1) #(N, 1, 32)
        for j in range(11):
            current_slot_embedding = slot_embeddings[:, j, :].unsqueeze(1) #(N, 1, 16)
            gru_input = torch.cat([flat_word_vectors_gru_unsqueezed, prev_tag_embedding, current_slot_embedding], dim=2)
            gru_output, gru_hidden = self.decoder_gru(gru_input, gru_hidden)

            tag_logit = self.gru_classifier_heads[j](gru_output[:, 0, :]) #(N, num_slot_options)
            output_logits.append(tag_logit)
            predicted_idx = torch.argmax(tag_logit, dim=1) #(N)
            predicted_idces.append(predicted_idx)

            prev_tag_embedding = self.gru_tag_slot_embedders[j](predicted_idx).unsqueeze(1) #(N, 1, 32)

        return output_logits, predicted_idces


    def poolWordTokens(self, token_windows, token_windows_loss_masks, token_windows_word_lengths):

        B, W, H = token_windows.shape
        L = W//2 #L is the char lstm's max words per window, which is always half of the transformer's token-window size

        flattened_selected_word_tokens = token_windows[token_windows_loss_masks]
        flattened_unpadded_lengths = token_windows_word_lengths[token_windows_word_lengths > 0]

        flattened_pooled_tokens = torch.segment_reduce(flattened_selected_word_tokens, 'mean', lengths=flattened_unpadded_lengths)

        word_counts_per_window = (token_windows_word_lengths > 0).sum(dim=1)

        rebuilt_pooled_windows = token_windows.new_zeros(B, L, H) #new_zeros() just inherits properties like device from the tensor you call it on; it still creates a new tensor and doesn't modify token_windows

        row_idx = torch.arange(B, device=token_windows.device).unsqueeze(1).expand(-1, L)
        col_idx = torch.arange(L, device=token_windows.device).unsqueeze(0).expand(B, -1)

        keep = col_idx < word_counts_per_window.unsqueeze(1) #returns a boolean mask of shape (B, L) that for each row has as many Trues as are in the corresponding entry of word_counts_per_window, with the rest being False

        rebuilt_pooled_windows[row_idx[keep], col_idx[keep]] = flattened_pooled_tokens

        return rebuilt_pooled_windows
    def poolWordTokensKeepFlat(self, token_windows, token_windows_loss_masks, token_windows_word_lengths):

        B, W, H = token_windows.shape
        L = W//2 #L is the char lstm's max words per window, which is always half of the transformer's token-window size

        flattened_selected_word_tokens = token_windows[token_windows_loss_masks]
        flattened_unpadded_lengths = token_windows_word_lengths[token_windows_word_lengths > 0]

        flattened_pooled_tokens = torch.segment_reduce(flattened_selected_word_tokens, 'mean', lengths=flattened_unpadded_lengths)

        return flattened_pooled_tokens

    def forward(self, token_windows, token_windows_loss_masks, token_windows_word_lengths, lstm_windows, lstm_word_masks, lstm_word_lengths, flat_pos_window_tensors, flat_morph_tag_window_tensors) -> torch.Tensor:
        ### TRANSFORMER ###
        token_embeddings = self.token_embedder(token_windows)
        positional_embeddings = self.positional_embedder(self.position_ids.expand(token_embeddings.size(0), -1))
        padding_mask = (token_windows == 0)

        token_states = self.transformer(token_embeddings + positional_embeddings, src_key_padding_mask=padding_mask)
        word_pooled_token_states = self.poolWordTokensKeepFlat(token_states, token_windows_loss_masks, token_windows_word_lengths)

        ### LSTM ###
        # B, W, L = lstm_windows.shape
        # flat_lstm_windows = lstm_windows.reshape(B*W, L)
        # flat_lstm_word_masks = lstm_word_masks.reshape(B*W)
        # flat_unwordpadded_lstm_windows = flat_lstm_windows[flat_lstm_word_masks]

        # lstm_char_embeddings = self.char_dropout(self.char_embedder(flat_unwordpadded_lstm_windows))
        # packed_char_embeddings = torch.nn.utils.rnn.pack_padded_sequence(lstm_char_embeddings, lstm_word_lengths.cpu(), batch_first=True, enforce_sorted=False)

        # packed_output, (h_n, c_n) = self.lstm(packed_char_embeddings)
        # flat_unpadded_word_vectors = torch.cat([h_n[0], h_n[1]], dim=1)

        # combined_final_word_vectors = torch.cat([word_pooled_token_states, flat_unpadded_word_vectors], dim=-1)
        combined_final_word_vectors = word_pooled_token_states

        ### GRU DECODER ###
        if self.training:
            return self.gru_decode_training(combined_final_word_vectors, flat_pos_window_tensors, flat_morph_tag_window_tensors)
        else:
            return self.gru_decode_inference(combined_final_word_vectors)
